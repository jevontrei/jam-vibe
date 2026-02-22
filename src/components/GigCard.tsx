import Link from "next/link"

type GigCardProps = {
  slug: string
  title: string
  datetime: Date
  venue: { name: string; slug: string; suburb: string | null }
  lineup: { project: { name: string; slug: string } }[]
  tags: { tag: { name: string; label: string } }[]
  price: string | null
}

export default function GigCard({ slug, title, datetime, venue, lineup, tags, price }: GigCardProps) {
  const time = datetime.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true })

  return (
    <Link href={`/gigs/${slug}`} className="block rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">{time} · <span className="hover:underline">{venue.name}</span>{venue.suburb ? `, ${venue.suburb}` : ""}</p>
          <h3 className="mt-0.5 font-semibold text-zinc-900 truncate">{title}</h3>
          {lineup.length > 0 && (
            <p className="mt-0.5 text-sm text-zinc-600">
              {lineup.map(l => l.project.name).join(", ")}
            </p>
          )}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map(({ tag }) => (
                <span key={tag.name} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>
        {price && (
          <p className="shrink-0 text-sm font-medium text-zinc-700">{price}</p>
        )}
      </div>
    </Link>
  )
}
