import { prisma } from "@/lib/prisma"
import Link from "next/link"
import SearchInput from "@/components/SearchInput"

export const metadata = { title: "Search — JAM" }

const dayLabel: Record<number, string> = {
  0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday",
  4: "Friday", 5: "Saturday", 6: "Sunday",
}

const frequencyLabel: Record<string, string> = {
  WEEKLY: "Weekly",
  FORTNIGHTLY: "Fortnightly",
  MONTHLY: "Monthly",
  IRREGULAR: "Irregular",
}

function SectionHeading({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-400">{label}</h2>
      <span className="text-sm text-zinc-400">({count})</span>
    </div>
  )
}

function TagPills({ tags }: { tags: { tag: { name: string; label: string } }[] }) {
  if (tags.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {tags.map(({ tag }) => (
        <span key={tag.name} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">
          {tag.label}
        </span>
      ))}
    </div>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ""

  if (!q) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900">Search</h1>
        <SearchInput />
        <p className="mt-6 text-sm text-zinc-400">Search across musicians, projects, venues, gigs, and residencies.</p>
      </main>
    )
  }

  const ci = { contains: q, mode: "insensitive" as const }
  const tagMatch = { tags: { some: { tag: { label: ci } } } }
  const tagSelect = { select: { tag: { select: { name: true, label: true } } } }

  const [musicians, projects, venues, gigs, residencies] = await Promise.all([
    prisma.person.findMany({
      where: { OR: [{ name: ci }, { bio: ci }, tagMatch] },
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        instruments: { select: { instrument: { select: { name: true } } } },
        tags: tagSelect,
      },
    }),

    prisma.project.findMany({
      where: { status: "PUBLISHED", OR: [{ name: ci }, { bio: ci }, tagMatch] },
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        members: { select: { person: { select: { name: true } } }, take: 3 },
        tags: tagSelect,
      },
    }),

    prisma.venue.findMany({
      where: { status: "PUBLISHED", OR: [{ name: ci }, { suburb: ci }, { description: ci }, tagMatch] },
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        suburb: true,
        tags: tagSelect,
      },
    }),

    prisma.gig.findMany({
      where: { status: "PUBLISHED", OR: [{ title: ci }, { description: ci }, tagMatch] },
      orderBy: { datetime: "asc" },
      select: {
        slug: true,
        title: true,
        datetime: true,
        venue: { select: { name: true } },
        tags: tagSelect,
      },
    }),

    prisma.residency.findMany({
      where: { OR: [{ name: ci }, { description: ci }, tagMatch] },
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        dayOfWeek: true,
        frequency: true,
        venue: { select: { name: true } },
        tags: tagSelect,
      },
    }),
  ])

  const hasResults =
    musicians.length > 0 ||
    projects.length > 0 ||
    venues.length > 0 ||
    gigs.length > 0 ||
    residencies.length > 0

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900">Search</h1>

      <SearchInput defaultValue={q} />

      <p className="mt-4 mb-8 text-sm text-zinc-400">
        {hasResults ? `Results for "${q}"` : `No results for "${q}"`}
      </p>

      {!hasResults && (
        <p className="text-sm text-zinc-400">Try a different search term.</p>
      )}

      <div className="flex flex-col gap-10">
        {musicians.length > 0 && (
          <section>
            <SectionHeading label="Musicians" count={musicians.length} />
            <div className="flex flex-col gap-3">
              {musicians.map(p => (
                <Link
                  key={p.slug}
                  href={`/musicians/${p.slug}`}
                  className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors"
                >
                  <p className="font-medium text-zinc-900">{p.name}</p>
                  {p.instruments.length > 0 && (
                    <p className="text-sm text-zinc-500">
                      {p.instruments.map(i => i.instrument.name).join(", ")}
                    </p>
                  )}
                  <TagPills tags={p.tags} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading label="Projects" count={projects.length} />
            <div className="flex flex-col gap-3">
              {projects.map(p => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors"
                >
                  <p className="font-medium text-zinc-900">{p.name}</p>
                  {p.members.length > 0 && (
                    <p className="text-sm text-zinc-500">
                      {p.members.map(m => m.person.name).join(", ")}
                    </p>
                  )}
                  <TagPills tags={p.tags} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {venues.length > 0 && (
          <section>
            <SectionHeading label="Venues" count={venues.length} />
            <div className="flex flex-col gap-3">
              {venues.map(v => (
                <Link
                  key={v.slug}
                  href={`/venues/${v.slug}`}
                  className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors"
                >
                  <p className="font-medium text-zinc-900">{v.name}</p>
                  {v.suburb && <p className="text-sm text-zinc-500">{v.suburb}</p>}
                  <TagPills tags={v.tags} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {gigs.length > 0 && (
          <section>
            <SectionHeading label="Gigs" count={gigs.length} />
            <div className="flex flex-col gap-3">
              {gigs.map(g => (
                <Link
                  key={g.slug}
                  href={`/gigs/${g.slug}`}
                  className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors"
                >
                  <p className="font-medium text-zinc-900">{g.title}</p>
                  <p className="text-sm text-zinc-500">
                    {g.datetime.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    {g.venue && ` · ${g.venue.name}`}
                  </p>
                  <TagPills tags={g.tags} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {residencies.length > 0 && (
          <section>
            <SectionHeading label="Residencies" count={residencies.length} />
            <div className="flex flex-col gap-3">
              {residencies.map(r => (
                <Link
                  key={r.slug}
                  href={`/residencies/${r.slug}`}
                  className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors"
                >
                  <p className="font-medium text-zinc-900">{r.name}</p>
                  <p className="text-sm text-zinc-500">
                    {frequencyLabel[r.frequency]} · {dayLabel[r.dayOfWeek]}s
                    {r.venue && ` · ${r.venue.name}`}
                  </p>
                  <TagPills tags={r.tags} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
