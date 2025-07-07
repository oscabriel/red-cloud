# Red-Cloud (Fullstack RedwoodJS Cloudflare Example)

This repo contain a fullstack example to build on Cloudflare with the following stack:

## Stack

- **RedwoodSDK**: A React framework to run react 19 with SSR/RSC/ServerFunctions/etc.. on Cloudflare
- **Drizzle ORM**: Lightweight, type-safe SQL ORM with migrations
- **Better-auth**: Simple, flexible authentication library - The example is setup to use OTP
- **Alchemy**: Infrastructure-as-Code without the dead weight
- **Shadcn**: A set of beautifully-designed, accessible components to build your component library
- **Bun**: a fast JavaScript all-in-one toolkit

## Resources

- D1 (as main DB)
- R2 (for avatar/file storage)
- Website running on workers using RedwoodSDK

All the required resources are configured via Alchmey in alchemy.run.ts

## Credits

- **Nick Balestra-Foster**: This example is a fork of Nick's [repo](https://github.com/nickbalestra/fullstack-cf-example) which provided a great foundation to tweak and build on top of.
- **MJ Meyer**: Nick's example was heavily inspired by MJ's [repo](https://github.com/mj-meyer/rwsdk-better-auth-drizzle), adding little things here and there, mainly Alchemy as IaC.
  - Check /types/env.d.ts to see how our IaC help defining our types (no need to generate types with Wrangler)
  - Check ./alchemy.run.ts to see how the whole infra is defined as code via Alchemy

## Getting Started

### 1 Create your new project:

```shell
git clone https://github.com/oscabriel/red-cloud
cd red-cloud
bun install
```

### 2 Setup your env virables

```shell
cp .env.example .env
```

### 3 Setup local dev environement then launch dev server

```shell
bun dev:init
bun dev
```

The application will be available at the URL displayed in your terminal (typically `http://localhost:5173`)

### 4 Deploy to Cloudflare

This will provision all the resources needed like db, ...
The application will be available at the Cloudflare URL displayed in your terminal.

```shell
bun infra:up
```

## Application Routes

This application includes the following key routes:

- **/** - Landing page with authentication and navigation
- **/guestbook** - Interactive guestbook where users can leave messages (requires authentication)
- **/profile** - User profile management with device session control (requires authentication)
- **/sign-in** - Authentication page with OTP and social login options
- **Protected Routes** - All authenticated routes use interruptor-based authentication middleware

## Authentication Flow

This example includes a complete authentication system with:

- OTP for signup and login (with email integration via Resend)
- Social authentication (Google & GitHub OAuth)
- Native better-auth session management with database persistence
- Protected routes with interruptor-based authentication
- Multi-device session support with proper logout functionality

## Database Configuration

### Local Development

The project uses Cloudflare D1 (SQLite) with Drizzle ORM. A local development database will automatically setup when you first run `bun dev` in `./wrangler`

### Database Schema

The authentication schema is defined in `src/db/schema` and includes tables for:

- Users
- Sessions
- Accounts

### Making Schema Changes

When you need to update your database schema:

1. Modify the schema files in `src/db/schema`
2. Generate a new migration: `bun migrate:new --name="your_migration_name"`
3. Apply the migration: `bun migrate:dev`

## Deployment

To deploy the whole application (app, db, ecc) to Cloudflare:

1. Run the infra:up command to spin up and deploy: `bun infra:up`
2. Run the infra:destroy to tear it down `bun infra:destroy`

Everytime you change anything to the infra definition and run `infra:up` your whole infra will be updated, that's it.

## Codebase Enhancements & Architecture

This project has evolved significantly from a basic implementation to a more production-ready codebase. Here are the major architectural improvements:

### 🏗️ Session Management

We've optimized the session management system to make the most of better-auth's native server-side APIs and db-first session storage:

- **Server-Side Session Fetching**: Uses `auth.api.getSession()` with `disableCookieCache: true` for fresh session data
- **SSR Optimization**: Pre-fetches session data on the server and passes to client components as props
- **Efficient Client Actions**: Uses `authClient.signOut()` and `authClient.revokeSession()` for session termination
- **No Session Caching**: We want to maintain fresh session data at all times to align with our realtime functionality

**Key Files:**
- `src/middleware/app-middleware.ts` - Server-side session loading using better-auth APIs
- `src/app/pages/profile/components/session-manager.tsx` - Multi-device session management with native better-auth actions

### 🎨 Theme System

We implemented a dark/light theme system that prevents hydration errors and FOUCs (Flashes of Unstyled Content) commonly encountered in SSR-first frameworks.

**Starting from the default [shadcn](https://ui.shadcn.com/docs/dark-mode/vite) recommendation, we added:**

- **Blocking Theme Script (`public/theme-script.js`)**:
  - Executes synchronously in the `<head>` before any React hydration
  - Reads theme preference from localStorage (`red-cloud-theme` key)
  - Immediately applies the correct theme class (`light`, `dark`) to `<html>`
  - Handles system preference detection via `prefers-color-scheme`
  - Includes error handling with fallback to system theme

- **Separate Theme Hook** (`src/app/hooks/use-theme.ts`): Separated hook logic from the theme-provider for better tree-shaking
- **Theme Provider** (`src/app/components/navigation/theme-provider.tsx`): Manages theme state with SSR-safe initialization
- **CSS Variables** (`src/app/document/styles.css`): Tailwind v4 with custom properties for light/dark modes
- **Hydration Warning Suppression** (`src/client.tsx`): Suppresses Radix UI ID mismatch warnings to clean up console output

**Achievements:**
- Zero flash theme switching
- System preference detection
- Persistent user choice via localStorage
- Hydration-safe SSR compatibility

### 📁 Feature-Based Architecture

Migrated from single-file pages to a well-organized, feature-based directory structure:

**Pages Reorganization:**
```
src/app/pages/
├── guestbook/
│   ├── guestbook-page.tsx   # page component
│   ├── functions.ts         # server functions
│   └── components/          # specialized components
├── profile/
│   ├── profile-page.tsx
│   ├── functions.ts
│   └── components/
└── sign-in/
    ├── sign-in-page.tsx
    └── components/
```

**Library Organization:**
```
src/lib/
├── auth/ - Better-auth config and utilities
├── utils/ - Centralized utility functions and constants
└── validators/ - Zod validation schemas by feature
```

### 🔧 Technical Improvements

**Authentication Enhancements:**
- **Centralized config**: All better-auth setup in `src/lib/auth/index.ts`
- **Multi-session Support**: Enabled via better-auth plugins for better user experience
- **Email OTP Integration**: Configured with Resend for reliable email delivery
- **Social Providers**: Google and GitHub OAuth support

**Validation & Type Safety:**
- **Feature-based Validators**: Organized Zod schemas by functionality (auth, guestbook, profile)
- **Comprehensive Type Definitions**: New `src/types/` directory with API, hooks, session, and UI types
- **Enhanced TypeScript Coverage**: Improved type safety across the entire application

**Developer Experience:**
- **Centralized Constants**: Consolidated all reusable constants under `src/lib/utils/constants.ts`
- **Consistent Error Handling**: Standardized error responses using RedwoodSDK patterns
- **Improved Logging**: Better development-time debugging with structured logging
- **Code Quality**: Enhanced linting and formatting compliance with Biome.js

### 🎯 UI/UX Enhancements

**User Experience Improvements:**
- **Onboarding Flow**: Dialog-based user onboarding for better first-time experience   
- **Toast Notifications**: Sonner integration for user feedback
- **Loading States**: Skeleton components for better perceived performance
- **Form Validation**: Enhanced client and server-side validation with better error messages

## Project Structure

```
red-cloud/
├─ .cursor/                      # Rules reference for AI
├─ .instructions/                # Planning and task list files for AI 
├─ src/                          # Central app directory
│  ├─ api/                       # API routes used in worker.tsx  
│  ├─ app/                       # UI components and core application logic
│  │  ├─ components/             # Reusable UI components          
│  │  ├─ document/               # Root document config
│  │  ├─ hooks/                  # Custom React hooks
│  │  ├─ layouts/                # Layout components
│  │  ├─ pages/                  # Feature-based page organization
│  │  │  ├─ feature/             # Feature page directory
│  │  │  │  ├─ components/       # Feature-specific components
│  │  │  │  ├─ functions.ts      # Feature-specific server functions
│  │  │  │  └─ feature-page.tsx  # Feature page component
│  │  │  └─ landing.tsx          # Landing page component
│  │  └─ providers/              # React context providers
│  ├─ db/                        # Database instance/schema/migrations
│  ├─ lib/                       # Shared/auxiliary application logic
│  │  ├─ auth/                   # Better-Auth config
│  │  ├─ utils/                  # Utility functions, constants, etc
│  │  └─ validators/             # Zod validation schemas
│  ├─ middleware/                # Request middleware and rwsdk interruptors
│  ├─ types/                     # Shared app type definitions
│  ├─ client.tsx                 # Client-side entry point
│  └─ worker.tsx                 # Server-side entry point
├─ types/                        # Global type definitions
├─ public/                       # Image/font/script files
├─ alchemy.run.ts                # Alchemy Infrastructure-as-Code
├─ biome.json                    # Biome linter/formatter config
├─ components.json               # shadcn/ui config
├─ drizzle.config.ts             # Drizzle ORM config
├─ package.json                  # Dependencies and scripts
├─ tailwind.config.ts            # Tailwind CSS config
├─ tsconfig.json                 # TypeScript config
├─ vite.config.mts               # Vite build config
└─ wrangler.jsonc                # Wrangler file (generated by Alchemy)
```
