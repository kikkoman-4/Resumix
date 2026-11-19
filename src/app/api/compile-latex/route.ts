import { NextRequest, NextResponse } from "next/server";
import { generateLatexDocument } from "@/lib/latexGenerator";
import { ResumeData } from "@/types/resume";
import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import crypto from "crypto";

const execFileAsync = promisify(execFile);

// Helper to find pdflatex executable path if not in standard PATH
function getPdflatexBinary(): string {
  const customCandidates = [
    "pdflatex",
    "J:\\Apps\\Miktex\\miktex\\bin\\x64\\pdflatex.exe",
    "C:\\Program Files\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe",
    path.join(os.homedir(), "AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe"),
    "C:\\texlive\\2025\\bin\\windows\\pdflatex.exe",
    "C:\\texlive\\2024\\bin\\windows\\pdflatex.exe",
    "C:\\texlive\\2023\\bin\\win32\\pdflatex.exe",
  ];

  for (const candidate of customCandidates) {
    if (candidate === "pdflatex") return candidate;
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return "pdflatex";
}

export async function POST(req: NextRequest) {
  let tempDir = "";
  try {
    const body = await req.json();
    const resume: ResumeData | undefined = body.resume;
    const directLatex: string | undefined = body.latexCode;

    const latexSource = directLatex || (resume ? generateLatexDocument(resume) : null);

    if (!latexSource) {
      return NextResponse.json(
        { success: false, error: "No resume data or LaTeX code provided." },
        { status: 400 }
      );
    }

    // Check if user requested raw .tex file
    const url = new URL(req.url);
    if (url.searchParams.get("format") === "tex") {
      return new NextResponse(latexSource, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": 'attachment; filename="resume.tex"',
        },
      });
    }

    // Create unique temporary workspace directory
    const uniqueId = crypto.randomBytes(6).toString("hex");
    tempDir = path.join(os.tmpdir(), `resumix-latex-${uniqueId}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const texFilePath = path.join(tempDir, "resume.tex");
    fs.writeFileSync(texFilePath, latexSource, "utf8");

    const pdfBinary = getPdflatexBinary();

    // Compile with pdflatex
    try {
      await execFileAsync(
        pdfBinary,
        [
          "-interaction=nonstopmode",
          "-halt-on-error",
          `-output-directory=${tempDir}`,
          "resume.tex",
        ],
        {
          cwd: tempDir,
          timeout: 15000,
        }
      );
    } catch (compileErr: unknown) {
      // Parse log file for human-readable LaTeX error
      const logFilePath = path.join(tempDir, "resume.log");
      const err = compileErr instanceof Error ? compileErr.message : "Compilation failed";
      let errorDetails = err;

      if (fs.existsSync(logFilePath)) {
        const logContent = fs.readFileSync(logFilePath, "utf8");
        const lines = logContent.split("\n");
        const errorLines: string[] = [];
        let capturing = false;

        for (const line of lines) {
          if (line.startsWith("!")) {
            capturing = true;
          }
          if (capturing) {
            errorLines.push(line);
            if (errorLines.length > 8 || line.trim() === "") {
              break;
            }
          }
        }

        if (errorLines.length > 0) {
          errorDetails = errorLines.join("\n");
        } else {
          errorDetails = logContent.slice(-1000);
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: errorDetails,
          latexSource,
        },
        { status: 422 }
      );
    }

    const outputPdfPath = path.join(tempDir, "resume.pdf");
    if (!fs.existsSync(outputPdfPath)) {
      return NextResponse.json(
        { success: false, error: "PDF output file was not generated." },
        { status: 500 }
      );
    }

    const pdfBuffer = fs.readFileSync(outputPdfPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume.pdf"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("LaTeX Compilation Error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    engine: "pdfTeX / LaTeX",
    binary: getPdflatexBinary(),
  });
}
