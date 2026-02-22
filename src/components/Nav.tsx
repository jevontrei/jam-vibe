"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

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
  const pathname = usePathname()

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center gap-6 px-4 py-3">
        <Link href="/" className="font-bold text-zinc-900 shrink-0">JAM</Link>
        <nav className="flex items-center gap-4 overflow-x-auto">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link key={href} href={href}
                className={`shrink-0 text-sm transition-colors ${active ? "font-medium text-zinc-900" : "text-zinc-500 hover:text-zinc-900"}`}>
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
