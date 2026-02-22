import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Projects — JAM" }

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      bio: true,
      tags: { select: { tag: { select: { name: true, label: true } } } },
      members: {
        select: {
          role: true,
          person: { select: { name: true, slug: true } },
        },
      },
    },
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">Projects</h1>

      {projects.length > 0 ? (
        <div className="flex flex-col gap-3">
          {projects.map(project => (
            <Link key={project.slug} href={`/projects/${project.slug}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors">
              <h2 className="font-semibold text-zinc-900">{project.name}</h2>
              {project.members.length > 0 && (
                <p className="mt-0.5 text-sm text-zinc-500">
                  {project.members.map(m => m.person.name).join(", ")}
                </p>
              )}
              {project.bio && (
                <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{project.bio}</p>
              )}
              {project.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {project.tags.map(({ tag }) => (
                    <span key={tag.name} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No projects listed yet.</p>
      )}
    </main>
  )
}
