# 🚀 Resumix

> **Resumix** is a modern, web-based AI resume builder and tailoring studio engineered to help you craft, customize, and compile pixel-perfect, ATS-optimized resumes in minutes. Powered by a **zero-dependency LaTeX compilation engine**, **Google Gemini AI**, and an **interactive Code Mode**, Resumix bridges the gap between intuitive visual editing and high-precision typographic typesetting.

---

## ✨ Key Features

### 📄 Zero-Dependency LaTeX Engine
- **Vector PDF Output:** Compiles true vector PDFs using native `pdfTeX` with selectable text, scalable typography, and ATS parser compatibility.
- **Clickable Hyperref Links:** Automatic link generation for email, phone, website, LinkedIn, and GitHub profiles.
- **Dual Export:** Download print-ready `.pdf` files or download the full raw `.tex` source code at any time.
- **Zero External LaTeX Package Dependencies:** Crafted using robust native LaTeX dimension primitives (`tabular*`, `\pdfstartlink`, `xcolor`), ensuring instant compilation (~700ms) on any standard TeX distribution without missing package errors.

### 💻 Interactive LaTeX Code Mode
- **Dual Mode Switcher:** Toggle instantly between the structured visual **Form** and raw **LaTeX Code Mode**.
- **Real-Time LaTeX Editor:** Edit the TeX source directly with instant PDF preview recompilation.
- **Resizable Split View:** Drag the horizontal split handle to expand the code editor up to full width, with double-click reset to default width (520px).
- **Built-in Find & Replace (`Ctrl + F` / `Ctrl + H`):** In-editor search bar with real-time match highlighting, match count badges, Next (`Enter` / `F3`) and Previous (`Shift + Enter`) navigation, and single or Replace All execution.
- **Synchronized Word Wrapping (`Alt + Z`):** Toggle word wrap with dynamic shadow-measured line heights so line numbers remain aligned with wrapped text blocks.

### ⚡ Dual-Mode Skills & Expertise Studio
- **🤖 Automatic AI Job Tailoring (Google Gemini):**
  - Paste any job description, ATS requirements, or tech stack.
  - Gemini AI extracts, categorizes, and prioritizes matching skills into structured categories (e.g. *Languages*, *Frameworks*, *Cloud & DevOps*, *Databases*).
  - Choose between **Smart Replace** (targeted rebuild) or **Smart Merge** (enhances existing skills).
  - Review and toggle extracted skill pills before applying directly to your resume.
  - Supports free Google Gemini API keys with local browser persistence and an automatic offline ATS keyword fallback.
- **📚 Manual Override (Languages & Frameworks Catalog):**
  - Interactive checklist of **150+** popular industry technologies (languages, frontend/backend frameworks, databases, cloud providers, DevOps tools, AI/ML libraries, and testing tools).
  - Instant live search and category filter pills (*Languages*, *Frontend*, *Backend*, *Databases*, *Cloud*, *AI*, *Mobile*, *Testing*, *Tools*).
  - Interactive checkbox cards showing current active status and containing categories.
  - Smart auto-routing into existing or newly generated categories, plus a custom skill quick-add bar.

### 🔀 Category Reordering & Visibility Manager (`Layout` Tab)
- **HTML5 Drag-and-Drop Reordering:** Easily rearrange sections (*Summary*, *Work Experience*, *Skills*, *Projects*, *Education*) using grab handles or quick Up/Down buttons.
- **Section Visibility Toggles (`Eye` / `EyeOff`):** Temporarily disable or hide any section from the compiled PDF without losing your data.
- **Sidebar Status Indicators:** Left navigation sidebar displays amber indicator dots and `(Hidden from PDF)` tooltips for excluded sections.
- **Section Header Banners:** Toggle category visibility directly from within any section editor tab.
- **Quick Actions:** One-click **Enable All** and **Reset Order** to restore standard layout.

### ✍️ Visual Form Editor & AI Polisher
- **Structured Form Inputs:** Dedicated editors for Personal Details, Professional Summary, Work Experience, Skills, Projects, and Education.
- **Item Reordering:** Move individual work experience, project, and education entries up and down with dedicated controls.
- **AI Bullet Enhancer:** Transform bullet points with strong active verbs and quantifiable impact.
- **Typography & Font Customizer:** Adjust font family (*Helvetica*, *Times*, *Courier*), font sizes, and section line dividers in real time.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI & Components:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Document & PDF Compilation:** LaTeX (`pdflatex` / `pdfTeX`)
- **AI & Job Tailoring:** [Google Gemini API](https://aistudio.google.com/) (`gemini-2.5-flash`), OpenAI API
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** TypeScript 5 (Strict Mode)

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js:** v18.18 or higher (v20+ recommended)
2. **TeX Distribution:** A local LaTeX distribution providing `pdflatex`:
   - **Windows:** [MiKTeX](https://miktex.org/) or [TeX Live](https://www.tug.org/texlive/)
   - **macOS:** [MacTeX](https://www.tug.org/mactex/)
   - **Linux:** `sudo apt-get install texlive-latex-base texlive-latex-recommended`

Verify that `pdflatex` is available in your terminal:
```bash
pdflatex --version
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/resumix.git
   cd resumix
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment configuration:
   ```bash
   cp .env.example .env.local
   ```
   Add your optional API keys in `.env.local`:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   # Free Google Gemini API Key (from https://aistudio.google.com/app/apikey)
   GEMINI_API_KEY=your_gemini_api_key_here
   # Optional OpenAI API Key for bullet point polishing
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   *(Note: You can also enter your free Gemini API key directly in the web app UI).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
resumix/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── compile-latex/     # Server-side pdflatex compilation endpoint
│   │   │   ├── enhance/           # AI bullet point enhancement endpoint
│   │   │   └── tailor-skills/     # Gemini AI & ATS skills tailoring endpoint
│   │   ├── layout.tsx             # Root layout & font definition
│   │   └── page.tsx               # Main studio workspace (Form, Code & PDF Preview)
│   ├── components/
│   │   ├── DraggableSectionOrder.tsx   # Category drag-and-drop & visibility manager
│   │   ├── GeminiSkillsTailorModal.tsx # AI Job Tailoring modal (Gemini)
│   │   ├── LatexCodeEditor.tsx         # In-browser LaTeX editor with search & wrap
│   │   ├── RealPdfViewer.tsx           # Debounced live PDF preview viewport
│   │   ├── ResumePdfExport.tsx         # Vector PDF & .tex source download actions
│   │   ├── SkillCatalogModal.tsx       # 150+ technology checklist & manual override
│   │   └── TypographyModal.tsx         # Font & typography customizer
│   ├── lib/
│   │   ├── latexGenerator.ts      # Zero-dependency LaTeX document generator
│   │   └── skillsCatalog.ts       # Curated tech catalog & local ATS keyword scanner
│   └── types/
│       └── resume.ts              # Core resume data models & TypeScript interfaces
├── .env.example                   # Template environment variables
├── .gitignore                     # Git ignore rules
├── package.json
└── README.md
```

---

## ⌨️ Useful Keyboard Shortcuts (Code Mode)

| Shortcut | Action |
|---|---|
| `Ctrl + F` | Open Find & Replace Bar |
| `Ctrl + H` | Open Find & Replace Bar |
| `Enter` / `F3` | Find Next Occurrence |
| `Shift + Enter` | Find Previous Occurrence |
| `Alt + Z` | Toggle Word Wrapping (Synchronized Line Gutter) |
| `Ctrl + S` | Compile PDF Preview |
| `Esc` | Close Find Bar / Modals |

---

## 🤝 Contributing

Contributions, issues, and feature suggestions are welcome!
Feel free to open an issue or submit a pull request:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
