# JAM Vibe Codebase Explanation

This is a Next.js 16 App Router site for discovering Brisbane/Meanjin jazz scene content: gigs, venues, musicians, projects, residencies, blogs, and organisations.

## Core Stack

- Next.js + React + TypeScript: [package.json](./package.json)
- Prisma ORM on Postgres (Neon adapter): [prisma/schema.prisma](./prisma/schema.prisma), [src/lib/prisma.ts](./src/lib/prisma.ts)
- Better Auth (email/password + Google): [src/lib/auth.ts](./src/lib/auth.ts), [src/app/api/auth/[...all]/route.ts](./src/app/api/auth/[...all]/route.ts)
- Tailwind v4 styling: [src/app/globals.css](./src/app/globals.css)
- Leaflet map for venues: [src/components/VenueMap.tsx](./src/components/VenueMap.tsx)

## Structure

- App shell/layout: [src/app/layout.tsx](./src/app/layout.tsx)
- Route pages are mostly server components under `src/app/*` and query Prisma directly.
- Client components are mainly UI interaction/auth components (`Nav`, `Footer`, search input, filters, auth forms, map wrapper): [src/components](./src/components)

## Data Model

Main entities:

- `Person`
- `Project`
- `Venue`
- `Gig`
- `Residency`
- `Blog`
- `Organisation`
- `Tag`

The schema uses join tables for tags, memberships, lineups, editors, and saved items. `ContentStatus` gates published vs draft content. Better Auth tables (`users`, `accounts`, `sessions`, `verifications`) are integrated in the same schema.

## Route Behavior

- Homepage aggregates sections via parallel Prisma queries: [src/app/page.tsx](./src/app/page.tsx)
- List/detail route pairs:
  - gigs: [src/app/gigs/page.tsx](./src/app/gigs/page.tsx), [src/app/gigs/[slug]/page.tsx](./src/app/gigs/[slug]/page.tsx)
  - venues: [src/app/venues/page.tsx](./src/app/venues/page.tsx), [src/app/venues/[slug]/page.tsx](./src/app/venues/[slug]/page.tsx)
  - musicians: [src/app/musicians/page.tsx](./src/app/musicians/page.tsx), [src/app/musicians/[slug]/page.tsx](./src/app/musicians/[slug]/page.tsx)
  - projects: [src/app/projects/page.tsx](./src/app/projects/page.tsx), [src/app/projects/[slug]/page.tsx](./src/app/projects/[slug]/page.tsx)
  - residencies: [src/app/residencies/page.tsx](./src/app/residencies/page.tsx), [src/app/residencies/[slug]/page.tsx](./src/app/residencies/[slug]/page.tsx)
  - blogs: [src/app/blogs/page.tsx](./src/app/blogs/page.tsx), [src/app/blogs/[slug]/page.tsx](./src/app/blogs/[slug]/page.tsx)
  - organisations: [src/app/organisations/page.tsx](./src/app/organisations/page.tsx), [src/app/organisations/[slug]/page.tsx](./src/app/organisations/[slug]/page.tsx)
- Cross-model search: [src/app/search/page.tsx](./src/app/search/page.tsx)
- About page pulls hero image metadata from `SiteAsset` and resolves S3 URL: [src/app/about/page.tsx](./src/app/about/page.tsx), [src/lib/s3.ts](./src/lib/s3.ts)

## Current Maturity

- Read-focused app currently; no full CRUD/admin UI yet.
- Auth is wired and sign-in/up pages exist, but sign-in links are commented out in nav/footer.
- Only API route is Better Auth handler.
- Seed data is comprehensive for local/demo bootstrap: [prisma/seed.ts](./prisma/seed.ts)
- README is still the default Next template, not project-specific: [README.md](./README.md)
- No test files currently present.
