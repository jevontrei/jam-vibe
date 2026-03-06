"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const links = [
  { href: "/organisations", label: "Organisations" },
  { href: "/blogs", label: "Blogs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  const linkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return `text-sm transition-colors ${active ? "font-semibold text-violet-700" : "text-zinc-500 hover:text-zinc-900"}`;
  };

  return (
    <footer className="p-8 border-b border-violet-100 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-3">
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}
          {
            session ? (
              <span className="flex items-center gap-3">
                <span className="text-sm text-zinc-500">
                  {session.user.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Sign out
                </button>
              </span>
            ) : null /* <Link href="/sign-in" className={linkClass("/sign-in")}>Sign in</Link> */
          }
        </nav>
      </div>
    </footer>
  );
}
