import { prisma } from "@/lib/prisma"
import GigCard from "@/components/GigCard"

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function dayLabel(date: Date) {
  return date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })
}

export default async function HomePage() {
  const now = new Date()
  const weekFromNow = new Date(now)
  weekFromNow.setDate(weekFromNow.getDate() + 7)

  const gigSelect = {
    slug: true,
    title: true,
    datetime: true,
    price: true,
    venue: { select: { name: true, slug: true, suburb: true } },
    lineup: { select: { project: { select: { name: true, slug: true } } } },
    tags: { select: { tag: { select: { name: true, label: true } } } },
  } as const

  // Tonight
  const tonightGigs = await prisma.gig.findMany({
    where: {
      status: "PUBLISHED",
      datetime: { gte: startOfDay(now), lte: endOfDay(now) },
    },
    orderBy: { datetime: "asc" },
    select: gigSelect,
  })

  // This week (days 1–7, grouped by day)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const weekGigs = await prisma.gig.findMany({
    where: {
      status: "PUBLISHED",
      datetime: { gte: startOfDay(tomorrow), lte: endOfDay(weekFromNow) },
    },
    orderBy: { datetime: "asc" },
    select: gigSelect,
  })

  // Group week gigs by day
  const byDay = new Map<string, typeof weekGigs>()
  for (const gig of weekGigs) {
    const key = gig.datetime.toDateString()
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key)!.push(gig)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">JAM</h1>
        <p className="mt-1 text-zinc-500">Jazz Almanac Meanjin — your guide to live jazz across Brisbane</p>
      </div>

      {/* Tonight */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Tonight</h2>
        {tonightGigs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {tonightGigs.map(gig => <GigCard key={gig.slug} {...gig} />)}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">No gigs listed tonight.</p>
        )}
      </section>

      {/* This Week */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">This Week</h2>
        {byDay.size > 0 ? (
          <div className="flex flex-col gap-8">
            {Array.from(byDay.entries()).map(([dateStr, gigs]) => (
              <div key={dateStr}>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-400">
                  {dayLabel(gigs[0].datetime)}
                </h3>
                <div className="flex flex-col gap-3">
                  {gigs.map(gig => <GigCard key={gig.slug} {...gig} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Nothing listed this week yet.</p>
        )}
      </section>
    </main>
  )
}
