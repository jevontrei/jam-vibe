import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

const dayLabel: Record<number, string> = {
  0: "Mon",
  1: "Tue",
  2: "Wed",
  3: "Thu",
  4: "Fri",
  5: "Sat",
  6: "Sun",
};

const frequencyLabel: Record<string, string> = {
  WEEKLY: "Weekly",
  FORTNIGHTLY: "Fortnightly",
  MONTHLY: "Monthly",
  IRREGULAR: "Irregular",
};

export default async function HomePage() {
  const now = new Date();

  const [tonightGigs, residencies, venues, projects, people, latestBlog] =
    await Promise.all([
      // Tonight
      prisma.gig.findMany({
        where: {
          status: "PUBLISHED",
          datetime: { gte: startOfDay(now), lte: endOfDay(now) },
        },
        orderBy: { datetime: "asc" },
        take: 4,
        select: {
          slug: true,
          title: true,
          datetime: true,
          price: true,
          venue: { select: { name: true, suburb: true } },
          lineup: { select: { project: { select: { name: true } } } },
        },
      }),
      // Regular nights
      prisma.residency.findMany({
        where: { active: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        take: 5,
        select: {
          slug: true,
          name: true,
          dayOfWeek: true,
          frequency: true,
          startTime: true,
          venue: { select: { name: true } },
        },
      }),
      // Venues
      prisma.venue.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { name: "asc" },
        take: 6,
        select: { slug: true, name: true, suburb: true },
      }),
      // Projects
      prisma.project.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { name: "asc" },
        take: 5,
        select: {
          slug: true,
          name: true,
          members: { select: { person: { select: { name: true } } } },
          tags: { select: { tag: { select: { label: true } } }, take: 2 },
        },
      }),
      // People
      prisma.person.findMany({
        orderBy: { name: "asc" },
        take: 8,
        select: {
          slug: true,
          name: true,
          instruments: {
            select: { instrument: { select: { name: true } } },
            take: 2,
          },
        },
      }),
      // Latest blog
      prisma.blog.findFirst({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: {
          slug: true,
          title: true,
          publishedAt: true,
          createdBy: { select: { name: true } },
          tags: { select: { tag: { select: { label: true } } }, take: 3 },
        },
      }),
    ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Hero */}
      <div className="mb-10 flex flex-col items-center text-center">
        <Image
          src="/JAM_logo.png"
          alt="JAM"
          width={880}
          height={439}
          className="h-28 w-auto max-w-full sm:h-36 md:h-44"
          priority
        />
        <p className="mt-3 text-zinc-500">
          Your guide to jazz and live music across Meanjin/Brisbane
        </p>
      </div>

      {/* Tile grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Tonight */}
        <section className="rounded-xl border border-zinc-200 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-400">
              Tonight
            </h2>
            <Link
              href="/gigs"
              className="text-xs text-violet-400 hover:text-violet-600 transition-colors"
            >
              All gigs →
            </Link>
          </div>
          {tonightGigs.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {tonightGigs.map((gig) => (
                <Link
                  key={gig.slug}
                  href={`/gigs/${gig.slug}`}
                  className="flex items-start justify-between gap-3 py-2.5 hover:opacity-70 transition-opacity"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm text-zinc-900">
                      {gig.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {gig.datetime.toLocaleTimeString("en-AU", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                      {gig.venue.name ? ` · ${gig.venue.name}` : ""}
                    </p>
                  </div>
                  {gig.price && (
                    <span className="shrink-0 text-xs font-medium text-zinc-600">
                      {gig.price}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Nothing listed tonight.</p>
          )}
        </section>

        {/* Regular nights */}
        <section className="rounded-xl border border-zinc-200 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-400">
              Regular Nights
            </h2>
            <Link
              href="/residencies"
              className="text-xs text-violet-400 hover:text-violet-600 transition-colors"
            >
              All residencies →
            </Link>
          </div>
          {residencies.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {residencies.map((r) => (
                <Link
                  key={r.slug}
                  href={`/residencies/${r.slug}`}
                  className="flex items-start justify-between gap-3 py-2.5 hover:opacity-70 transition-opacity"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm text-zinc-900">
                      {r.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {dayLabel[r.dayOfWeek]}s · {r.startTime}
                      {r.venue ? ` · ${r.venue.name}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400">
                    {frequencyLabel[r.frequency]}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">
              No regular nights listed yet.
            </p>
          )}
        </section>

        {/* Venues — full width */}
        <section className="rounded-xl border border-zinc-200 p-5 md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-400">
              Venues
            </h2>
            <Link
              href="/venues"
              className="text-xs text-violet-400 hover:text-violet-600 transition-colors"
            >
              All venues →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {venues.map((v) => (
              <Link
                key={v.slug}
                href={`/venues/${v.slug}`}
                className="rounded-lg bg-violet-50 p-3 hover:bg-violet-100 transition-colors"
              >
                <p className="font-medium text-sm text-zinc-900 truncate">
                  {v.name}
                </p>
                {v.suburb && (
                  <p className="text-xs text-zinc-500">{v.suburb}</p>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="rounded-xl border border-zinc-200 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-400">
              Projects
            </h2>
            <Link
              href="/projects"
              className="text-xs text-violet-400 hover:text-violet-600 transition-colors"
            >
              All projects →
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {projects.map((p) => (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                className="block py-2.5 hover:opacity-70 transition-opacity"
              >
                <p className="font-medium text-sm text-zinc-900">{p.name}</p>
                {p.members.length > 0 && (
                  <p className="text-xs text-zinc-500 truncate">
                    {p.members.map((m) => m.person.name).join(", ")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* People */}
        <section className="rounded-xl border border-zinc-200 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-400">
              People
            </h2>
            <Link
              href="/people"
              className="text-xs text-violet-400 hover:text-violet-600 transition-colors"
            >
              All people →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {people.map((p) => (
              <Link
                key={p.slug}
                href={`/people/${p.slug}`}
                className="rounded-lg bg-violet-50 p-3 hover:bg-violet-100 transition-colors"
              >
                <p className="font-medium text-sm text-zinc-900 truncate">
                  {p.name}
                </p>
                {p.instruments.length > 0 && (
                  <p className="text-xs text-zinc-500 truncate">
                    {p.instruments.map((i) => i.instrument.name).join(", ")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Latest blog — full width */}
        {latestBlog && (
          <section className="rounded-xl border border-zinc-200 p-5 md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                From the Blog
              </h2>
              <Link
                href="/blogs"
                className="text-xs text-violet-400 hover:text-violet-600 transition-colors"
              >
                All posts →
              </Link>
            </div>
            <Link
              href={`/blogs/${latestBlog.slug}`}
              className="group block hover:opacity-70 transition-opacity"
            >
              <p className="font-semibold text-zinc-900 group-hover:underline">
                {latestBlog.title}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500">
                {latestBlog.createdBy.name}
                {latestBlog.publishedAt && (
                  <>
                    {" "}
                    ·{" "}
                    {new Date(latestBlog.publishedAt).toLocaleDateString(
                      "en-AU",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </>
                )}
              </p>
              {latestBlog.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {latestBlog.tags.map(({ tag }) => (
                    <span
                      key={tag.label}
                      className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
