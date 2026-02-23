import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Suspense } from "react"
import PeopleFilterPanel from "@/components/PeopleFilterPanel"

export const metadata = { title: "People — JAM" }

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ instrument?: string | string[]; tag?: string | string[] }>
}) {
  const params = await searchParams

  const rawInstruments = params.instrument
  const rawTags = params.tag
  const selectedInstruments = Array.isArray(rawInstruments)
    ? rawInstruments
    : rawInstruments
    ? [rawInstruments]
    : []
  const selectedTags = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : []

  const [allInstruments, allTags, people] = await Promise.all([
    prisma.instrument.findMany({
      where: { people: { some: {} } },
      orderBy: { name: "asc" },
      select: { name: true },
    }),
    prisma.tag.findMany({
      where: { people: { some: {} } },
      orderBy: { label: "asc" },
      select: { name: true, label: true },
    }),
    prisma.person.findMany({
      where: {
        ...(selectedInstruments.length > 0 && {
          instruments: { some: { instrument: { name: { in: selectedInstruments } } } },
        }),
        ...(selectedTags.length > 0 && {
          tags: { some: { tag: { name: { in: selectedTags } } } },
        }),
      },
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        bio: true,
        instruments: { select: { instrument: { select: { name: true } } } },
        tags: { select: { tag: { select: { name: true, label: true } } } },
      },
    }),
  ])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">People</h1>

      <Suspense>
        <PeopleFilterPanel
          instruments={allInstruments.map(i => i.name)}
          tags={allTags}
          selectedInstruments={selectedInstruments}
          selectedTags={selectedTags}
        />
      </Suspense>

      <p className="mb-4 text-sm text-zinc-400">
        {people.length} {people.length === 1 ? "person" : "people"}
      </p>

      {people.length > 0 ? (
        <div className="flex flex-col gap-3">
          {people.map(person => (
            <Link
              key={person.slug}
              href={`/people/${person.slug}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors"
            >
              <h2 className="font-semibold text-zinc-900">{person.name}</h2>
              {person.instruments.length > 0 && (
                <p className="mt-0.5 text-sm text-zinc-500">
                  {person.instruments.map(i => i.instrument.name).join(", ")}
                </p>
              )}
              {person.bio && (
                <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{person.bio}</p>
              )}
              {person.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {person.tags.map(({ tag }) => (
                    <span
                      key={tag.name}
                      className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No people match the selected filters.</p>
      )}
    </main>
  )
}
