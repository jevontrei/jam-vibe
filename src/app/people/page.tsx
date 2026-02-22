import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "People — JAM" }

export default async function PeoplePage() {
  const people = await prisma.person.findMany({
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      bio: true,
      instruments: { select: { instrument: { select: { name: true } } } },
    },
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">People</h1>

      {people.length > 0 ? (
        <div className="flex flex-col gap-3">
          {people.map(person => (
            <Link key={person.slug} href={`/people/${person.slug}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors">
              <h2 className="font-semibold text-zinc-900">{person.name}</h2>
              {person.instruments.length > 0 && (
                <p className="mt-0.5 text-sm text-zinc-500">
                  {person.instruments.map(i => i.instrument.name).join(", ")}
                </p>
              )}
              {person.bio && (
                <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{person.bio}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No people listed yet.</p>
      )}
    </main>
  )
}
