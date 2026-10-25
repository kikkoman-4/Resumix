# Resumix Development & Context Optimization Rules

## Token Efficiency & Best Practices
- **Progressive Discovery**: Avoid reading full files if only a function or type is needed; inspect line ranges or target files directly.
- **Client vs Server Components**: Keep leaf components marked with `'use client'` where React hooks or browser APIs are used. Keep layout/data fetching server-side.
- **Type Safety**: Maintain strict TypeScript interfaces in `src/types/` for all resume data models (Personal details, Experience, Education, Skills, Custom Sections).
- **Styling**: Use Tailwind CSS utility classes adhering to the modern design system and clean typography. Avoid mixing ad-hoc inline styles.
- **PDF Rendering**: Never render `@react-pdf/renderer` components on the server. Always dynamically import PDF viewer / download components with `{ ssr: false }`.
