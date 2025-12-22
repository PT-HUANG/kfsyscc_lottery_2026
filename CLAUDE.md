# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1.0 application for a lottery system (kfsyscc_lottery_2026), using React 18.3.1 with TypeScript. The project uses pnpm as the package manager and includes the React Compiler for optimized performance.

## Common Commands

### Development
```bash
pnpm dev          # Start development server at http://localhost:3000
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Architecture

### Framework & Routing
- **Next.js App Router**: Uses the app directory structure (src/app/)
- **React Compiler**: Enabled in next.config.ts for automatic optimization

### TypeScript Configuration
- **Path Alias**: `@/*` maps to `./src/*` for cleaner imports
- **Target**: ES2017 with strict mode enabled
- **Module Resolution**: bundler mode for Next.js optimization

### Directory Structure
```
src/
  app/              # Next.js App Router pages and layouts
    layout.tsx      # Root layout with Geist fonts
    page.tsx        # Home page
    globals.css     # Global styles
```

### Styling
- CSS Modules for component-level styles (e.g., page.module.css)
- Geist Sans and Geist Mono fonts from next/font/google

### ESLint Configuration
- Uses Next.js recommended configs (core-web-vitals + typescript)
- Flat config format (eslint.config.mjs)
- Ignores: .next/, out/, build/, next-env.d.ts

## Key Technical Details

- **Package Manager**: Must use pnpm (pnpm-workspace.yaml present)
- **Image Optimization**: Next.js Image component with sharp@0.34.5
- **React Version**: 18.3.1
