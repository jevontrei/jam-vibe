"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/gigs", label: "Gigs" },
  { href: "/venues", label: "Venues" },
  { href: "/projects", label: "Projects" },
  { href: "/people", label: "People" },
  { href: "/residencies", label: "Residencies" },
  { href: "/organisations", label: "Organisations" },
  { href: "/blogs", label: "Blogs" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return `text-sm transition-colors ${active ? "font-medium text-zinc-900" : "text-zinc-500 hover:text-zinc-900"}`;
  };

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="font-bold text-zinc-900" onClick={() => setOpen(false)}>
          JAM
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className={`block h-0.5 w-6 bg-zinc-700 transition-all duration-200 ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-zinc-700 transition-all duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-zinc-700 transition-all duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="md:hidden border-t border-zinc-100 bg-white px-4 pb-4 pt-2 flex flex-col gap-4">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
