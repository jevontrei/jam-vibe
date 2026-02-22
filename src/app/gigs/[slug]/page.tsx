import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function GigPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const gig = await prisma.gig.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      venue: true,
      residency: { select: { name: true, slug: true } },
      lineup: {
        orderBy: { order: "asc" },
        include: {
          project: {
            include: {
              members: {
                include: {
                  person: {
                    include: { instruments: { include: { instrument: true } } },
                  },
                },
              },
            },
          },
        },
      },
      tags: { include: { tag: true } },
    },
  })

  if (!gig) notFound()

  const date = gig.datetime.toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })
  const time = gig.datetime.toLocaleTimeString("en-AU", {
    hour: "numeric", minute: "2-digit", hour12: true,
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link href="/gigs" className="text-sm text-zinc-400 hover:text-zinc-600">← Gigs</Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{gig.title}</h1>

      {/* Date / time / venue */}
      <div className="mt-3 flex flex-col gap-1 text-sm text-zinc-600">
        <p>{date} · {time}</p>
        <p>
          <Link href={`/venues/${gig.venue.slug}`} className="hover:underline font-medium">
            {gig.venue.name}
          </Link>
          {gig.venue.suburb ? `, ${gig.venue.suburb}` : ""}
        </p>
        {gig.price && <p className="font-medium text-zinc-800">{gig.price}</p>}
      </div>

      {/* Tags */}
      {gig.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {gig.tags.map(({ tag }) => (
            <span key={tag.name} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {gig.description && (
        <p className="mt-6 text-zinc-700 leading-relaxed">{gig.description}</p>
      )}

      {/* Lineup */}
      {gig.lineup.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">Lineup</h2>
          <div className="flex flex-col gap-4">
            {gig.lineup.map(({ project }) => (
              <div key={project.slug}>
                <Link href={`/projects/${project.slug}`} className="font-semibold text-zinc-900 hover:underline">
                  {project.name}
                </Link>
                {project.members.length > 0 && (
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {project.members.map(m => {
                      const instrs = m.person.instruments.map(pi => pi.instrument.name).join(", ")
                      return `${m.person.name}${instrs ? ` (${instrs})` : ""}`
                    }).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Residency link */}
      {gig.residency && (
        <p className="mt-8 text-sm text-zinc-500">
          Part of{" "}
          <Link href={`/residencies/${gig.residency.slug}`} className="font-medium text-zinc-700 hover:underline">
            {gig.residency.name}
          </Link>
        </p>
      )}

      {/* External links */}
      {Array.isArray(gig.links) && gig.links.length > 0 && (
        <div className="mt-6 flex gap-4">
          {(gig.links as { label: string; url: string }[]).map(link => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-600 hover:underline">
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </main>
  )
}
