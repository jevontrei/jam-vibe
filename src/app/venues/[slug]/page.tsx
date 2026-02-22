import { prisma } from "@/lib/prisma"
import GigCard from "@/components/GigCard"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const venue = await prisma.venue.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      tags: { include: { tag: true } },
      residencies: {
        where: { active: true },
        include: { project: { select: { name: true, slug: true } } },
      },
      gigs: {
        where: { status: "PUBLISHED", datetime: { gte: new Date() } },
        orderBy: { datetime: "asc" },
        select: {
          slug: true,
          title: true,
          datetime: true,
          price: true,
          venue: { select: { name: true, slug: true, suburb: true } },
          lineup: { select: { project: { select: { name: true, slug: true } } } },
          tags: { select: { tag: { select: { name: true, label: true } } } },
        },
      },
    },
  })

  if (!venue) notFound()

  const frequencyLabel: Record<string, string> = {
    WEEKLY: "Weekly",
    FORTNIGHTLY: "Fortnightly",
    MONTHLY: "Monthly",
    IRREGULAR: "Irregular",
  }

  const dayLabel: Record<number, string> = {
    0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday",
    4: "Friday", 5: "Saturday", 6: "Sunday",
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link href="/venues" className="text-sm text-violet-400 hover:text-violet-600">← Venues</Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{venue.name}</h1>

      <div className="mt-2 flex flex-col gap-0.5 text-sm text-zinc-500">
        {venue.suburb && <p>{venue.suburb}</p>}
        {venue.address && <p>{venue.address}</p>}
      </div>

      {venue.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {venue.tags.map(({ tag }) => (
            <span key={tag.name} className="rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-700">
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {venue.description && (
        <p className="mt-6 leading-relaxed text-zinc-700">{venue.description}</p>
      )}

      {/* External links */}
      {Array.isArray(venue.links) && venue.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {(venue.links as { label: string; url: string }[]).map(link => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-600 hover:underline">
              {link.label} ↗
            </a>
          ))}
        </div>
      )}

      {/* Residencies */}
      {venue.residencies.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-violet-400">Regular nights</h2>
          <div className="flex flex-col gap-3">
            {venue.residencies.map(r => (
              <Link key={r.slug} href={`/residencies/${r.slug}`}
                className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors">
                <p className="font-semibold text-zinc-900">{r.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-zinc-500">
                  <span>{frequencyLabel[r.frequency]}</span>
                  <span>·</span>
                  <span>{dayLabel[r.dayOfWeek]}s</span>
                  <span>·</span>
                  <span>{r.startTime}</span>
                  {r.project && <><span>·</span><span className="text-zinc-600">{r.project.name}</span></>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming gigs */}
      {venue.gigs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-violet-400">Upcoming gigs</h2>
          <div className="flex flex-col gap-3">
            {venue.gigs.map(gig => <GigCard key={gig.slug} {...gig} />)}
          </div>
        </section>
      )}
    </main>
  )
}
