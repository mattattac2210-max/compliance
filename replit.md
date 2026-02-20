# DSCVR — Compliance Navigator

## Overview
DSCVR Compliance Navigator is a web application designed to guide users through a "Seven-Gate Compliance Journey" for Bali villa operations. It facilitates adherence to legal and regulatory processes, such as PT PMA company formation and licensing, through a structured, multi-gate flow. The application aims to provide a comprehensive compliance solution, featuring a dark-themed, teal-accented user interface. Key capabilities include a searchable Compliance Terminology Decoder glossary, document vault, compliance timeline, alert center, and a compliance calendar. The project envisions simplifying complex regulatory landscapes for villa operators, enhancing compliance efficiency, and reducing legal risks.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite.
- **Routing**: Wouter for client-side navigation.
- **State Management**: TanStack React Query for data fetching and state management.
- **UI/UX**: Utilizes shadcn/ui (New York style) built on Radix UI primitives, styled with Tailwind CSS. The design incorporates a dark theme with a deep navy/teal color scheme, using Montserrat (headings) and Lato (body) fonts.
- **Animations**: Framer Motion is used for UI transitions, particularly in the gate flow.
- **Core Features**:
    - **Seven-Gate Compliance Journey**: A multi-stage flow guiding users through regulatory processes.
    - **Compliance Terminology Decoder**: A database-backed, searchable, tag-filterable glossary accessible via an admin page.
    - **Document Vault**: Manages property-specific documents, tracking status and expiry, with a reporting feature.
    - **Compliance Timeline**: Displays fixed recurring deadlines and vault document expiry dates.
    - **Alert Centre**: Notifies users of overdue and upcoming compliance events.
    - **Compliance Calendar**: A Pro-only feature for tracking compliance events, including pre-built recurring events and custom event support, with month grid, year strip, and filter chips.
    - **Dashboard**: Differentiates between Free and Pro user experiences, offering tailored insights and feature access.
    - **Process Navigation Guides**: Provides step-by-step workflow cards with detailed explanations and glossary integration.
    - **User Authentication & Property Management**: Secure user login/registration and CRUD operations for villa properties.
    - **SaaS Layout**: Features a persistent sidebar with navigation, property selector, and freemium gating for Pro features.
    - **Admin Dashboard**: For user management and support access control.

### Backend
- **Runtime**: Node.js with Express 5, written in TypeScript.
- **API**: All routes are prefixed with `/api`.
- **Storage**: Abstract `IStorage` interface, with an in-memory `MemStorage` for development, designed to be swapped with a database-backed implementation.
- **Development**: Vite middleware integrated with Express for Hot Module Replacement (HMR).
- **Production**: Static files served from `dist/public`, server bundled with esbuild.

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect.
- **Schema**: Defined in `shared/schema.ts`, including tables for users, properties, vault documents, document templates, compliance terms, process guides, banjar contributions, recurring filings, staff members, support access grants, and admin access logs.
- **Validation**: Zod schemas generated from Drizzle schemas.
- **Migrations**: Drizzle Kit for schema synchronization.
- **Connection**: Requires `DATABASE_URL` environment variable for PostgreSQL.

### Shared Code
- The `shared/` directory contains common schemas and types for both frontend and backend, accessible via `@shared/*` alias.

### Build System
- **Development**: `npm run dev` starts Express with Vite.
- **Production**: Custom script `script/build.ts` for client (Vite) and server (esbuild) bundling.

## External Dependencies

### Core Infrastructure
- **PostgreSQL**: Main database for data persistence.
- **Google Fonts**: Hosts Montserrat and Lato font families.

### Key npm Packages
- **Drizzle ORM & Drizzle Kit**: For database interaction and migrations.
- **Express 5**: Backend web framework.
- **TanStack React Query**: Frontend data management.
- **Radix UI**: Headless UI components.
- **Tailwind CSS**: Utility-first CSS framework.
- **Framer Motion**: Animation library.
- **Zod**: Schema validation.
- **Wouter**: Client-side router.
- **connect-pg-simple**: PostgreSQL session store.
- **Vite**: Frontend build tool.
- **bcrypt**: For password hashing.
- **express-session**: Session management.

### Replit-specific
- `@replit/vite-plugin-runtime-error-modal`
- `@replit/vite-plugin-cartographer`
- `@replit/vite-plugin-dev-banner`