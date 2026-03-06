import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getImageUrl } from "@/lib/s3";

export const metadata = { title: "About — JAM" };

export default async function AboutPage() {
  const hero = await prisma.siteAsset.findUnique({
    where: { key: "about-hero" },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">
        About
      </h1>

      <div className="flex flex-col gap-4 leading-relaxed text-zinc-700">
        <p>
          JAM is a community project, born in conversation between a couple of
          local rats in early 2026. This is a democratic place for jazz and
          related music in Brisbane/Meanjin — free to use, free to contribute,
          and run by the people on the ground.
        </p>

        {hero && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <Image
              src={getImageUrl(hero.s3Key)}
              alt={hero.altText ?? "JAM — Jazz Almanac Meanjin"}
              width={800}
              height={500}
              className="w-full object-cover"
              priority
            />
          </div>
        )}
        <p>
          We list gigs, venues, artists, residencies, and organisations. Anyone
          can submit content; a small editorial team keeps things tidy. No
          paywalls, no algorithms, no ads.
        </p>
        <p>
          If you play, book, promote, run a venue, or just love this music —
          this is for you.
        </p>

        <h2 className="mt-6 text-lg font-semibold text-zinc-900">
          Get involved
        </h2>
        <p>
          Submit a gig, claim your artist profile, or write a blog post. If you
          want to help with the site itself, JAM is open source —{" "}
          <a
            href="https://github.com/jevontrei/jam-vibe"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-900"
          >
            github.com/jevontrei/jam-vibe
          </a>
          .
        </p>

        <h2 className="mt-6 text-lg font-semibold text-zinc-900">Contact</h2>
        <p>
          Want your residency listed, or have feedback?{" "}
          <a
            href="/contact"
            className="underline hover:text-zinc-900"
          >
            Get in touch
          </a>
          .
        </p>
      </div>
    </main>
  );
}
