---
name: resumix-pdf-workflow
description: >-
  Use this skill when implementing, debugging, or styling PDF export templates and previews in Resumix using @react-pdf/renderer.
---

# Resumix PDF Export & Rendering Workflow

Cheatsheet for implementing pixel-perfect, ATS-friendly resume PDFs using `@react-pdf/renderer` in Next.js.

## Critical Next.js & React-PDF Rules

1. **Client-side only rendering**:
   `@react-pdf/renderer` relies on browser Canvas/Blob APIs. Always use dynamic import:
   ```tsx
   import dynamic from 'next/dynamic';

   export const PDFViewer = dynamic(
     () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
     { ssr: false }
   );
   ```

2. **Style Sheet Constraints**:
   - Use `StyleSheet.create({...})` from `@react-pdf/renderer`.
   - Do NOT use standard CSS or Tailwind classes inside `@react-pdf/renderer` primitive components (`<Document>`, `<Page>`, `<View>`, `<Text>`).
   - Use standard flexbox properties (`flexDirection`, `justifyContent`, `alignItems`, `flexGrow`).

3. **Page Breaks & ATS Formatting**:
   - Wrap resume sections in `<View wrap={false}>` to avoid awkward breaks across pages.
   - Use clean, standard fonts (Helvetica, Times-Roman, or registered Google Fonts via `Font.register()`).
