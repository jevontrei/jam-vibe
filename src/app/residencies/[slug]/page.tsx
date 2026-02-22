import { prisma } from "@/lib/prisma"
import GigCard from "@/components/GigCard"
import Link from "next/link"
import { notFound } from "next/navigation"

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

export default async function ResidencyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const residency = await prisma.residency.findUnique({
    where: { slug },
    include: {
      venue: true,
      project: {
        include: {
          members: {
            include: {
              person: { include: { instruments: { include: { instrument: true } } } },
            },
          },
        },
      },
      tags: { include: { tag: true } },
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

  if (!residency) notFound()

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link href="/residencies" className="text-sm text-violet-400 hover:text-violet-600">← Residencies</Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{residency.name}</h1>

      {/* Key info */}
      <div className="mt-3 flex flex-col gap-1 text-sm text-zinc-600">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span>{frequencyLabel[residency.frequency]}</span>
          <span>·</span>
          <span>{dayLabel[residency.dayOfWeek]}s</span>
          <span>·</span>
          <span>{residency.startTime}</span>
        </div>
        {residency.venue && (
          <p>
            <Link href={`/venues/${residency.venue.slug}`} className="font-medium hover:underline">
              {residency.venue.name}
            </Link>
            {residency.venue.suburb ? `, ${residency.venue.suburb}` : ""}
          </p>
        )}
      </div>

      {residency.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {residency.tags.map(({ tag }) => (
            <span key={tag.name} className="rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-700">
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {residency.description && (
        <p className="mt-6 leading-relaxed text-zinc-700">{residency.description}</p>
      )}

      {/* Regular project / lineup */}
      {residency.project && (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-violet-400">House band</h2>
          <Link href={`/projects/${residency.project.slug}`}
            className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors">
            <p className="font-semibold text-zinc-900">{residency.project.name}</p>
            {residency.project.members.length > 0 && (
              <div className="mt-0.5 flex flex-col gap-0.5 text-sm text-zinc-500">
                {residency.project.members.map(m => {
                  const instrs = m.person.instruments.map(pi => pi.instrument.name).join(", ")
                  return (
                    <span key={m.person.slug}>
                      {m.person.name}{instrs ? ` (${instrs})` : ""}
                    </span>
                  )
                })}
              </div>
            )}
          </Link>
        </section>
      )}

      {/* Upcoming instances */}
      {residency.gigs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-violet-400">Upcoming dates</h2>
          <div className="flex flex-col gap-3">
            {residency.gigs.map(gig => <GigCard key={gig.slug} {...gig} />)}
          </div>
        </section>
      )}
    </main>
  )
}
