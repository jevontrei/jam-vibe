import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"

const categoryLabel: Record<string, string> = {
  SCHOOL: "School",
  FESTIVAL: "Festival",
  RADIO: "Radio",
  PUBLICATION: "Publication",
  COLLECTIVE: "Collective",
  OTHER: "Other",
}

export default async function OrganisationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const org = await prisma.organisation.findUnique({
    where: { slug },
    include: {
      tags: { include: { tag: true } },
    },
  })

  if (!org) notFound()

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link href="/organisations" className="text-sm text-violet-400 hover:text-violet-600">← Organisations</Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{org.name}</h1>

      <p className="mt-1 text-sm text-zinc-500">{categoryLabel[org.category] ?? org.category}</p>

      {org.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {org.tags.map(({ tag }) => (
            <span key={tag.name} className="rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-700">
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {org.description && (
        <p className="mt-6 leading-relaxed text-zinc-700">{org.description}</p>
      )}

      {Array.isArray(org.links) && org.links.length > 0 && (
        <div className="mt-6 flex gap-4">
          {(org.links as { label: string; url: string }[]).map(link => (
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
