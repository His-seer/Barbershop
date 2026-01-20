# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 barbershop booking application with TypeScript, Tailwind CSS v4, and Supabase integration. Features a multi-step booking flow with premium design aesthetics (gold/black color scheme) targeting a luxury barbershop in Ghana.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production build
npm run start

# Lint the codebase
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5 with strict mode
- **Styling**: Tailwind CSS v4 with custom gold/richblack color palette
- **State Management**: Zustand for booking flow state
- **Database**: Supabase (PostgreSQL with SSR support)
- **Animations**: Framer Motion
- **UI Icons**: Lucide React
- **Date Handling**: date-fns, react-calendar

### Project Structure

```
booking-app/
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout with custom fonts (Outfit, Playfair Display)
│   │   ├── page.tsx      # Landing page
│   │   └── book/         # Booking flow page
│   ├── components/
│   │   ├── layout/       # Header and layout components
│   │   └── booking/      # Multi-step booking components
│   ├── store/            # Zustand state management
│   │   └── booking.ts    # Global booking state (services, addons, date/time, client info)
│   ├── utils/
│   │   └── supabase/     # Supabase client configurations
│   │       ├── client.ts # Browser client
│   │       └── server.ts # Server-side client with cookie handling
│   └── data/             # Mock data and constants
│       └── mock-services.ts
├── tailwind.config.ts     # Custom theme: gold/richblack palette, custom fonts
└── tsconfig.json          # TypeScript with @/* path aliases
```

### State Management (Zustand)

The booking flow uses a single Zustand store (`booking.ts`) with:
- **Step tracking**: 4-step flow (Service → Add-ons → Date/Time → Payment)
- **Service selection**: Main service + optional add-ons
- **Date/Time**: Calendar date and time slot
- **Client details**: Name, phone, optional email

State is client-side only and resets after booking completion.

### Supabase Integration

Two separate client factories:
- `utils/supabase/client.ts`: For client components (uses `createBrowserClient`)
- `utils/supabase/server.ts`: For server components/actions (uses `createServerClient` with cookie handling)

**Environment variables required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Styling Conventions

- **Colors**: Custom `gold` (50-900) and `richblack` (500-900) palettes
- **Fonts**:
  - Body: Outfit (via `--font-outfit` CSS variable)
  - Display/Headings: Playfair Display (via `--font-playfair`)
- **Typography**: Use `font-display` class for headings, uppercase tracking-widest for CTA text
- **Design Language**: Luxury barbershop aesthetic with gold accents on dark backgrounds

### Booking Flow Components

1. **Step1Services.tsx**: Service selection cards with auto-advance on click
2. **Step2And3.tsx**: Add-ons selection and date/time picker (two separate components exported from same file)
3. **Step4Payment.tsx**: Client details form and payment integration (Paystack)

Each step component reads/writes to the global booking store and manages its own step progression.

## Key Technical Patterns

### Path Aliases
Use `@/` for all internal imports (maps to `./src/`)

### Supabase Usage
- Always use the appropriate client (browser vs. server)
- Server client handles async cookie operations safely with try/catch
- Client components must use `"use client"` directive

### Animation Patterns
- Framer Motion for page transitions (`AnimatePresence` with mode="wait")
- Custom Tailwind animations: `fade-in`, `slide-up`, `glow-pulse`
- Hover effects use `whileHover` and `whileTap` props

### Responsive Design
- Mobile-first approach
- Breakpoints: `md:` for tablet/desktop layouts
- Sidebar collapses to top section on mobile

## Data Model

### Service Type
```typescript
{
  id: string;
  name: string;
  price: number;        // In GHS (Ghana Cedis)
  duration: number;     // In minutes
  category: 'haircut' | 'addon' | 'special';
}
```

Currently using mock data from `data/mock-services.ts`. Services include:
- Standard Cut (30 GHS)
- The Royal Treatment (80 GHS)
- Kids Cut (60 GHS)
- Home Service Premium (500 GHS)
- Add-ons: Beard Trim, Beard Dye, Texturizing

## Important Notes

- This is NOT a git repository yet
- No environment variables are currently set up (required for Supabase to function)
- Payment integration with Paystack is not yet implemented
- The app currently uses mock service data; database schema needs to be created in Supabase
- Next.js 16 uses React 19, which requires the `suppressHydrationWarning` prop on the body tag
