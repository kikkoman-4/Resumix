"use client";

import React, { useEffect, useState } from "react";
import { PDFDownloadLink, BlobProvider } from "@react-pdf/renderer";
import { ResumePdfDocument } from "./ResumePdfDocument";
import { ResumeData } from "@/types/resume";
import { Download, Loader2, FileCheck, Eye } from "lucide-react";

interface Props {
  resume: ResumeData;
}

export default function ResumePdfExport({ resume }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg opacity-60 cursor-not-allowed shadow"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Preparing PDF Engine...
      </button>
    );
  }

  const fileName = `${resume.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`;

  return (
    <div className="flex items-center gap-3">
      <BlobProvider document={<ResumePdfDocument resume={resume} />}>
        {({ url, loading }) => (
          <button
            onClick={() => {
              if (url) window.open(url, "_blank");
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-sm transition dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50"
            title="Open PDF Preview in a new tab"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            Preview Tab
          </button>
        )}
      </BlobProvider>

      <PDFDownloadLink
        document={<ResumePdfDocument resume={resume} />}
        fileName={fileName}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {({ loading }) => (
          <>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
}
