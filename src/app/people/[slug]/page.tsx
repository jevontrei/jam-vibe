import { prisma } from "@/lib/prisma"
import GigCard from "@/components/GigCard"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const person = await prisma.person.findUnique({
    where: { slug },
    include: {
      instruments: { include: { instrument: true } },
      projectMembers: {
        include: {
          project: {
            select: { name: true, slug: true, bio: true, status: true },
          },
        },
      },
    },
  })

  if (!person) notFound()

  const projectIds = person.projectMembers
    .map(m => m.project?.slug ? m.project : null)
    .filter(Boolean)
    .map(p => p!.slug)

  // Upcoming gigs via their projects
  const upcomingGigs = await prisma.gig.findMany({
    where: {
      status: "PUBLISHED",
      datetime: { gte: new Date() },
      lineup: { some: { project: { slug: { in: projectIds } } } },
    },
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
  })

  const projects = person.projectMembers
    .map(m => m.project)
    .filter((p): p is NonNullable<typeof p> => p !== null && !!p.slug && p.status === "PUBLISHED")

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/people" className="text-sm text-zinc-400 hover:text-zinc-600">← People</Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{person.name}</h1>

      {person.instruments.length > 0 && (
        <p className="mt-1 text-sm text-zinc-500">
          {person.instruments.map(i => i.instrument.name).join(", ")}
        </p>
      )}

      {person.bio && (
        <p className="mt-6 leading-relaxed text-zinc-700">{person.bio}</p>
      )}

      {/* External links */}
      {Array.isArray(person.links) && person.links.length > 0 && (
        <div className="mt-4 flex gap-4">
          {(person.links as { label: string; url: string }[]).map(link => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-600 hover:underline">
              {link.label} ↗
            </a>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">Projects</h2>
          <div className="flex flex-col gap-3">
            {projects.map(project => (
              <Link key={project.slug} href={`/projects/${project.slug}`}
                className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors">
                <p className="font-semibold text-zinc-900">{project.name}</p>
                {project.bio && (
                  <p className="mt-0.5 text-sm text-zinc-600 line-clamp-2">{project.bio}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming gigs */}
      {upcomingGigs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">Upcoming gigs</h2>
          <div className="flex flex-col gap-3">
            {upcomingGigs.map(gig => <GigCard key={gig.slug} {...gig} />)}
          </div>
        </section>
      )}
    </main>
  )
}
