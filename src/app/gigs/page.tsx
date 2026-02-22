import { prisma } from "@/lib/prisma"
import GigCard from "@/components/GigCard"

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function dayLabel(date: Date) {
  return date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })
}

export const metadata = { title: "Gigs — JAM" }

export default async function GigsPage() {
  const now = new Date()

  const gigSelect = {
    slug: true,
    title: true,
    datetime: true,
    price: true,
    venue: { select: { name: true, slug: true, suburb: true } },
    lineup: { select: { project: { select: { name: true, slug: true } } } },
    tags: { select: { tag: { select: { name: true, label: true } } } },
  } as const

  const upcomingGigs = await prisma.gig.findMany({
    where: {
      status: "PUBLISHED",
      datetime: { gte: startOfDay(now) },
    },
    orderBy: { datetime: "asc" },
    select: gigSelect,
  })

  // Group by day
  const byDay = new Map<string, typeof upcomingGigs>()
  for (const gig of upcomingGigs) {
    const key = gig.datetime.toDateString()
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key)!.push(gig)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">Gigs</h1>

      {byDay.size > 0 ? (
        <div className="flex flex-col gap-10">
          {Array.from(byDay.entries()).map(([, gigs]) => (
            <div key={gigs[0].datetime.toDateString()}>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-400">
                {dayLabel(gigs[0].datetime)}
              </h2>
              <div className="flex flex-col gap-3">
                {gigs.map(gig => <GigCard key={gig.slug} {...gig} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No upcoming gigs listed yet.</p>
      )}
    </main>
  )
}
