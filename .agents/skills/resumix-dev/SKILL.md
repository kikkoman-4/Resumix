---
name: resumix-dev
description: >-
  Use this skill when developing, testing, or building features for Resumix (AI Resume Builder),
  including managing resume state, drag-and-drop sections, PDF compilation, AI bullet enhancer, and running dev servers.
---

# Resumix Development Skill

This skill provides fast, low-token reference workflows for building and maintaining **Resumix**.

## Core Architectural Patterns

1. **State & Section Management**:
   - Resume sections (`basics`, `summary`, `work`, `education`, `skills`, `projects`, `custom`).
   - Order preserved as an array of IDs: `sectionOrder: string[]`.
   - When updating drag-and-drop lists, reorder state immutably.

2. **Client Components & SSR**:
   - Interactive components using `@hello-pangea/dnd` or `dnd-kit` require `'use client'`.
   - Dynamic imports for `@react-pdf/renderer` components with `{ ssr: false }` to avoid Next.js server-side DOM errors.

3. **AI Enhancement**:
   - Route handlers located at `src/app/api/enhance/route.ts` or `src/app/api/tailor/route.ts`.
   - Streaming responses using Vercel AI SDK or direct OpenAI API calls.

## Standard Commands

- **Run Dev Server**: `npm run dev`
- **Lint Code**: `npm run lint`
- **Production Build Check**: `npm run build`

## Best Practices for Token Optimization

- Read specific sub-components or types rather than entire directories.
- Reference shared types in `src/types/resume.ts`.
- Keep API routes focused on structured JSON in / streaming text out.
