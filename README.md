# 🚀 Resumix

> **Resumix** is a web-based AI resume builder and tailor designed to help you organize, polish, and export application-ready resumes in minutes. Feed in your background experience, effortlessly reorder sections with drag-and-drop, enhance content quality using AI, and download pixel-perfect PDFs.

---

## ✨ Features

- 📥 **Centralized Experience Hub:** Input or import your raw experience, project details, and past CV text all in one place.
- 🖱️ **Drag-and-Drop Builder:** Easily rearrange sections, work history, and skills with custom drag-and-drop mechanics.
- 🎨 **Automated Layout & Redesign:** Transform unformatted text into clean, professional, and readable resume layouts instantly.
- 🤖 **AI Quality Enhancer:** Refine bullet points, fix grammar, enhance action verbs, and optimize content impact.
- 📄 **One-Click PDF Export:** Export crisp, print-ready, ATS-friendly PDFs directly from your browser.
- 🔮 **More Coming Soon:** Custom template themes, target job description matching, and multi-version resume management.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) / React
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Drag & Drop:** `@hello-pangea/dnd` / `dnd-kit`
- **PDF Generation:** `@react-pdf/renderer`
- **AI Integration:** OpenAI API / Vercel AI SDK

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18 or higher) and `npm` / `pnpm` installed on your machine.

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

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your required keys:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open `http://localhost:3000` in your browser to view the application.

---

## 📅 Development Roadmap

- [x] Basic experience ingestion and structured data layout
- [x] Interactive drag-and-drop resume content editor
- [x] High-quality client-side PDF rendering & export
- [ ] AI prompt integration for dynamic bullet-point optimization
- [ ] Job description matching (ATS keyword analysis)
- [ ] Multiple template theme switcher

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
