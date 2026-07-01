# Veronica AI — Frontend

This directory contains the **React + TypeScript + Vite** frontend for the Veronica AI personal assistant.

> **Full project documentation is available in the [root README](../README.md).**

## Quick Start

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` with HMR, proxy configuration, and auto SSL.

## Available Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start Vite dev server               |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview production build            |
| `npm run host`    | Start dev server on network         |
| `npm run lint`    | Run ESLint                          |

## Tech Stack

- **React 19** with TypeScript 6
- **Vite 8** build tool
- **Redux Toolkit** + RTK Query for state & API
- **Framer Motion** for animations
- **Three.js r183** for 3D hologram rendering
- **Tailwind CSS 3** for styling
- **shadcn/ui** primitives
- **Lucide React** icons

## LLMs Used for UI development

- **Google Gemini** For Glassmorphism and entire UX migration from old Chakra UI base
- **ChatGPT Codex** For hooking up RTK and appropriate state management across the Frontend
- **Deepseek** Minor bug fixes and touch-ups at the end
