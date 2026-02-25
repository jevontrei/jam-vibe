import { prisma } from "@/lib/prisma"
import Link from "next/link"
import VenueMapWrapper from "@/components/VenueMapWrapper"

export const metadata = { title: "Venues — JAM" }

export default async function VenuesPage() {
  const venues = await prisma.venue.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      suburb: true,
      lat: true,
      lng: true,
      description: true,
      tags: { select: { tag: { select: { name: true, label: true } } } },
      _count: { select: { gigs: { where: { status: "PUBLISHED", datetime: { gte: new Date() } } } } },
    },
  })

  const mappableVenues = venues.filter(v => v.lat != null && v.lng != null) as Array<
    (typeof venues)[number] & { lat: number; lng: number }
  >

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900">Venues</h1>

      {mappableVenues.length > 0 && (
        <div className="mb-8 aspect-square w-full overflow-hidden rounded-lg border border-zinc-200">
          <VenueMapWrapper venues={mappableVenues} />
        </div>
      )}

      {venues.length > 0 ? (
        <div className="flex flex-col gap-3">
          {venues.map(venue => (
            <Link key={venue.slug} href={`/venues/${venue.slug}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-zinc-900">{venue.name}</h2>
                  {venue.suburb && <p className="text-sm text-zinc-500">{venue.suburb}</p>}
                  {venue.description && (
                    <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{venue.description}</p>
                  )}
                  {venue.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {venue.tags.map(({ tag }) => (
                        <span key={tag.name} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {venue._count.gigs > 0 && (
                  <p className="shrink-0 text-sm text-zinc-400">
                    {venue._count.gigs} upcoming
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No venues listed yet.</p>
      )}
    </main>
  )
}
