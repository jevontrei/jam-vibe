import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Organisations — JAM" }

const categoryLabel: Record<string, string> = {
  SCHOOL: "School",
  FESTIVAL: "Festival",
  RADIO: "Radio",
  PUBLICATION: "Publication",
  COLLECTIVE: "Collective",
  OTHER: "Other",
}

export default async function OrganisationsPage() {
  const orgs = await prisma.organisation.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      category: true,
      description: true,
      tags: { select: { tag: { select: { name: true, label: true } } } },
    },
  })

  // Group by category
  const grouped = orgs.reduce<Record<string, typeof orgs>>((acc, org) => {
    const key = org.category
    if (!acc[key]) acc[key] = []
    acc[key].push(org)
    return acc
  }, {})

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">Organisations</h1>

      {Object.keys(grouped).length > 0 ? (
        <div className="flex flex-col gap-10">
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                {categoryLabel[category] ?? category}
              </h2>
              <div className="flex flex-col gap-3">
                {items.map(org => (
                  <Link key={org.slug} href={`/organisations/${org.slug}`}
                    className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors">
                    <h3 className="font-semibold text-zinc-900">{org.name}</h3>
                    {org.description && (
                      <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{org.description}</p>
                    )}
                    {org.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {org.tags.map(({ tag }) => (
                          <span key={tag.name} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No organisations listed yet.</p>
      )}
    </main>
  )
}
