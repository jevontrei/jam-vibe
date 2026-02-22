# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

JAM (Jazz Almanac Meanjin) — a free, open-source community web app for Brisbane's jazz scene. Musicians, venues, gigs, and audiences in one place.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Database | PostgreSQL via Neon |
| ORM | Prisma |
| Auth | Better Auth |
| Components | Shadcn/ui + Tailwind |
| Media storage | AWS S3 |
| Email | Resend |
| Deployment | Vercel |

Styling: Tailwind-first. Element-level defaults go in `globals.css` using `@apply`.

## Commands

```bash
npm run dev        # dev server (Turbopack)
npm run build      # production build
npm run lint       # ESLint

npx prisma validate          # validate schema
npx prisma migrate dev       # apply schema changes (requires DATABASE_URL)
npx prisma studio            # browse data in browser
npx prisma generate          # regenerate client after schema changes
```

Prisma client is generated to `src/generated/prisma`. Import from there:
```typescript
import { PrismaClient } from "@/generated/prisma"
```

## Routes

```
/                        Homepage (Tonight + This Week gigs)
/gigs, /gigs/[slug]
/venues, /venues/[slug]
/projects, /projects/[slug]
/people, /people/[slug]
/residencies, /residencies/[slug]
/blogs, /blogs/[slug]
/organisations, /organisations/[slug]
/search
/about
```

Phase 2: `/sign-in`, `/sign-up`, `/dashboard`, `/profile`, `/submit/*`, `/admin`, `/people/[slug]/claim`

## Key components
`GigCard` · `DayGroup` · `VenueCard` · `ProjectCard` · `PersonCard` · `ResidencyCard` · `BlogCard` · `TagBadge` · `FilterPanel`

## Architecture

### Core entities
`users` · `people` · `projects` · `gigs` · `venues` · `residencies` · `tags` · `blogs` · `organisations` · `instruments`

### Key relationships
- `users` (auth identity, private) are separate from `people` (public profiles). A person can exist before a user claims it.
- `gigs` always have a `venue`. Gig lineups reference `projects`, never people directly. A solo show is a project with one member.
- `residencies` are recurring series (weekly/fortnightly/monthly). Individual `gigs` optionally link back to a residency.
- `projects` are composed of `people` via `project_members`.

### Ownership model
Every owned entity has:
- `createdBy` — immutable audit FK (the admin/user who created the record)
- `ownerId` — nullable FK, set when the real owner claims the page
- Editor junction tables (`gig_editors`, `venue_editors`, `project_members`) for multi-user edit access

### Content moderation
All user-submittable content (`gigs`, `venues`, `projects`, `blogs`) has a `status` field: `DRAFT → PENDING → PUBLISHED | REJECTED`.

### What users can save
`user_saved_gigs`, `user_saved_projects`, `user_saved_venues`, `user_saved_residencies`. Saving individual people is intentionally excluded.

## Phase Structure

**Phase 1** — read-only almanac. No public auth UI. Editorial team manages content as admin users. Gigs (one-off events) are the primary content; residencies are supporting reference.

**Phase 2** — auth, community submissions, profile claiming, saved items, moderation queue.

## Decisions & Conventions

- No engagement metrics (no attendance counts, no "interested" buttons).
- `links` on entities stored as `Json`: `[{ label, url }]`.
- `startTime` on residencies stored as a string (`"19:30"`).
- Slugs are human-readable URL identifiers stored in the DB (e.g. `/gigs/live-at-livs`).
- PWA preferred over React Native if mobile is ever needed.
- Use Server Actions for web app mutations. Add API routes only if a native mobile app requires them.
