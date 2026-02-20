# DSCVR — Compliance Navigator

## Overview

DSCVR Compliance Navigator is a web application that guides users through a "Seven-Gate Compliance Journey" for Bali villa operations. It presents a multi-gate compliance flow where each gate represents a stage in the legal/regulatory process (e.g., PT PMA company formation, licensing, etc.). The app features a dark-themed, teal-accented UI with animated gate cards, tabbed views (flow, audit, guide), and informational panels with alerts and portals to external resources.

The project follows a full-stack TypeScript architecture with a React frontend (Vite) and Express backend, using PostgreSQL via Drizzle ORM for data persistence. The app now uses the database for a Compliance Terminology Decoder glossary (searchable, tag-filterable accordion cards in the Guide tab), managed via a simple admin page at `/admin`.

## Recent Changes
- **2026-02-20**: Added multi-language i18n support (English, Ukrainian, Bahasa Indonesia). LanguageProvider context with localStorage persistence (key: "dscvr-lang"), LanguageSelector dropdown in header and admin. All UI text uses translation keys. DB tables extended with `translations` JSONB column for glossary terms and process guides with Ukrainian/Bahasa seed data. Light/dark theme support with ThemeProvider.
- **2026-02-19**: Added Process Navigation Guides feature with step-by-step workflow cards, expandable step timelines with detailed expand panels (why-this-matters, common issues, preparation tips, storage reminders), gate filters, info tabs (what to expect, delays, rejections, storage). GlossaryLink hover popover and GlossaryAwareText auto-linking system that detects glossary terms + synonyms in workflow text. Added `synonyms` field to compliance_terms table. New `process_navigation_guides` table with 1 seeded SLF Renewal workflow. API routes at `/api/guides`. Admin page updated with synonyms field.
- **2026-02-19**: Added Compliance Terminology Decoder glossary to Guide tab with search, tag filters, expandable accordion cards, copy-to-clipboard, and disclaimer. Database-backed with 11 seeded terms (including Zoning Certificate). Admin editor page at `/admin` for creating/editing/deactivating terms. API routes at `/api/terms`.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite with HMR support via custom dev server integration
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query with a custom `apiRequest` helper and `getQueryFn` factory
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Animations**: Framer Motion for gate card transitions and tab animations
- **Styling**: Tailwind CSS with CSS custom properties for a dark theme (deep navy/teal color scheme). Fonts are Montserrat (headings) and Lato (body) loaded from Google Fonts
- **Component Structure**: All reusable UI primitives live in `client/src/components/ui/`. Page components are in `client/src/pages/`. The main page is `home.tsx` which contains the full compliance gate flow

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, executed via `tsx`
- **API Pattern**: All API routes should be prefixed with `/api` and registered in `server/routes.ts`
- **Storage Layer**: Abstract `IStorage` interface in `server/storage.ts` with a `MemStorage` in-memory implementation as default. This can be swapped for a database-backed implementation
- **Dev Server**: In development, Vite middleware is integrated into Express for HMR. In production, static files are served from `dist/public`

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` — currently has a `users` table with `id`, `username`, and `password` fields
- **Validation**: Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization
- **Connection**: Requires `DATABASE_URL` environment variable pointing to a PostgreSQL instance
- **Note**: The current storage implementation is in-memory (`MemStorage`). When adding database features, switch to a Drizzle-backed implementation of `IStorage`

### Shared Code
- The `shared/` directory contains code shared between frontend and backend (schemas, types)
- Path alias `@shared/*` maps to `shared/*` in both TypeScript and Vite configs

### Build System
- **Development**: `npm run dev` runs the Express server with Vite middleware via tsx
- **Production Build**: Custom `script/build.ts` that builds the client with Vite and bundles the server with esbuild. Server dependencies are selectively bundled (allowlist pattern) to optimize cold start times
- **Output**: Client builds to `dist/public`, server builds to `dist/index.cjs`

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets` → `attached_assets/`

## External Dependencies

### Core Infrastructure
- **PostgreSQL**: Primary database (requires `DATABASE_URL` env var)
- **Google Fonts**: Montserrat and Lato font families loaded externally

### Key npm Packages
- **Drizzle ORM + Drizzle Kit**: Database ORM and migration tooling for PostgreSQL
- **Express 5**: HTTP server framework
- **TanStack React Query**: Server state management
- **Radix UI**: Headless UI component primitives (full suite installed)
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library used in the gate flow UI
- **Zod**: Schema validation (shared between client and server)
- **Wouter**: Lightweight client-side routing
- **connect-pg-simple**: PostgreSQL session store (available but not yet wired up)
- **Vite**: Frontend build tool with React plugin

### Replit-specific
- `@replit/vite-plugin-runtime-error-modal`: Runtime error overlay in development
- `@replit/vite-plugin-cartographer`: Dev tooling (conditionally loaded)
- `@replit/vite-plugin-dev-banner`: Dev environment banner (conditionally loaded)