# DSCVR — Compliance Navigator

## Overview

DSCVR Compliance Navigator is a web application that guides users through a "Seven-Gate Compliance Journey" for Bali villa operations. It presents a multi-gate compliance flow where each gate represents a stage in the legal/regulatory process (e.g., PT PMA company formation, licensing, etc.). The app features a dark-themed, teal-accented UI with animated gate cards, tabbed views (flow, audit, guide), and informational panels with alerts and portals to external resources.

The project follows a full-stack TypeScript architecture with a React frontend (Vite) and Express backend, using PostgreSQL via Drizzle ORM for data persistence. The app now uses the database for a Compliance Terminology Decoder glossary (searchable, tag-filterable accordion cards in the Guide tab), managed via a simple admin page at `/admin`.

## Recent Changes
- **2026-02-20**: Phase 4a — SaaS sidebar layout with freemium gating. AppShell component with 220px sidebar (logo, property selector, vault progress ring for Pro users, nav sections OVERVIEW/TRACKING/REFERENCE/ACCOUNT, OTA countdown, user footer) + 56px topbar with breadcrumb, language/theme controls. Pro user tier: `isPro`/`proGrantedAt` fields on users table, `isAdmin` always implies Pro. ProRoute gating: free users see UpgradePage for Vault/Timeline/Alerts. Locked sidebar nav items at 40% opacity with hover tooltips. UpgradeModal with feature list and Stripe placeholder. DashboardStats: 3 stat cards (vault progress, expiring docs, active alerts) — Pro shows live data, free shows "—" with unlock buttons. Mobile sidebar: slides in as overlay with backdrop on <768px, hamburger toggle. Admin endpoint PATCH /api/admin/users/:id/pro for granting Pro access. All authenticated pages wrapped in AppShell, old standalone headers removed. 30+ new i18n keys (upgrade.*, shell.*, dashboard.*) across EN/UK/ID.
- **2026-02-20**: Vault page redesign — Property-focused UI with entity/location details in summary header. Gate status grid (8 color-coded interactive cards) with hover tooltips showing uploaded/missing/expiring/expired counts per gate, checkmark/alert icons. Quick Access panel with search and filter tabs (all/required/expiring/expired) for inline document editing without opening gate accordions. Generate Report button downloads CSV compliance report via GET /api/vault/report. "Paid feature" badge, pricing note, disclaimer, and privacy footer. 20+ new i18n keys across EN/UK/ID.
- **2026-02-20**: Phase 4 — Marketing landing page at `/`. Public-facing page with 9 sections: sticky header, hero with staggered word animation, urgency block, gate preview cards (blurred/locked for unauthenticated users), features, scope (tracks vs does not), language banner, final CTA, footer. Auth-aware CTAs: authenticated users see "Go to app" linking to `/app`, visitors see "Get access"/"Sign in" linking to register/login. Vault summary percentage shown for authenticated users. 50+ i18n keys across EN/UK/ID. Routing changed: `/` → LandingPage (public), `/app` → protected Home (compliance tool). All login/register redirects now go to `/app`. All "back to app" links in vault/timeline/alerts/profile/admin updated to `/app`.
- **2026-02-20**: Phase 2 — Document Vault (`/vault`), Compliance Timeline (`/timeline`), and Alert Centre (`/alerts`). New `vault_document_templates` table (23 seeded templates across gates 0-7 with i18n JSONB translations, isRequired, expiryMonths) and `vault_documents` table (per-property document tracking with status, expiryDate, notes). Vault API: GET /api/vault/templates (public), GET/POST /api/vault, PATCH /api/vault/:id, GET /api/vault/summary (all auth-protected with property ownership checks). Dynamic status computation (expired if past date, expiring if <90 days). Timeline page with fixed recurring deadlines (SPT Tahunan, PPh, PB1, BPJS, OTA) + vault document expiry dates, filter by all/overdue/this-month/next-90-days. Alert Centre with overdue/upcoming sections, localStorage-based dismiss. Header nav links (Vault, Timeline, Alerts) for authenticated users. All UI strings use i18n keys (50+ new keys across EN/UK/ID).
- **2026-02-20**: Phase 1 — User authentication (register/login with bcrypt, express-session with connect-pg-simple PostgreSQL session store) and property profile management (CRUD for villa properties with fields: propertyName, entityName, NIB, address, regency, KBLI). Extended users table with email, createdAt, lastLogin, isAdmin. New `properties` table with soft-delete. Auth API routes at `/api/auth/*`, property routes at `/api/properties`. Protected `/profile` route, login/register pages, useAuth hook. Header shows Sign in/Profile+Sign out based on auth state. All auth/profile UI strings added to i18n (en, uk, id).
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