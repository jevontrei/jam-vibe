import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Residencies — JAM" }

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

export default async function ResidenciesPage() {
  const residencies = await prisma.residency.findMany({
    where: { active: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    select: {
      slug: true,
      name: true,
      description: true,
      dayOfWeek: true,
      frequency: true,
      startTime: true,
      venue: { select: { name: true, slug: true, suburb: true } },
      project: { select: { name: true, slug: true } },
      tags: { select: { tag: { select: { name: true, label: true } } } },
    },
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">Residencies</h1>

      {residencies.length > 0 ? (
        <div className="flex flex-col gap-3">
          {residencies.map(r => (
            <Link key={r.slug} href={`/residencies/${r.slug}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors">
              <h2 className="font-semibold text-zinc-900">{r.name}</h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                {frequencyLabel[r.frequency]} · {dayLabel[r.dayOfWeek]}s · {r.startTime}
                {r.venue && <> · {r.venue.name}{r.venue.suburb ? `, ${r.venue.suburb}` : ""}</>}
              </p>
              {r.project && (
                <p className="mt-0.5 text-sm text-zinc-500">{r.project.name}</p>
              )}
              {r.description && (
                <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{r.description}</p>
              )}
              {r.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.tags.map(({ tag }) => (
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
        <p className="text-sm text-zinc-400">No residencies listed yet.</p>
      )}
    </main>
  )
}
