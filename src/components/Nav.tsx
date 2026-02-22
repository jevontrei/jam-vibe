import Link from "next/link"

const links = [
  { href: "/gigs", label: "Gigs" },
  { href: "/venues", label: "Venues" },
  { href: "/projects", label: "Projects" },
  { href: "/people", label: "People" },
  { href: "/residencies", label: "Residencies" },
  { href: "/blogs", label: "Blogs" },
  { href: "/about", label: "About" },
]

export default function Nav() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center gap-6 px-4 py-3">
        <Link href="/" className="font-bold text-zinc-900 shrink-0">JAM</Link>
        <nav className="flex items-center gap-4 overflow-x-auto">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className="shrink-0 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
