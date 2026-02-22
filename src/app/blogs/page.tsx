import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Blogs — JAM" }

export default async function BlogsPage() {
  const blogs = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      publishedAt: true,
      createdBy: { select: { name: true } },
      tags: { select: { tag: { select: { name: true, label: true } } } },
    },
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">Blogs</h1>

      {blogs.length > 0 ? (
        <div className="flex flex-col divide-y divide-zinc-100">
          {blogs.map(blog => (
            <Link key={blog.slug} href={`/blogs/${blog.slug}`}
              className="block py-5 hover:opacity-75 transition-opacity">
              <h2 className="font-semibold text-zinc-900">{blog.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {blog.createdBy.name}
                {blog.publishedAt && (
                  <> · {new Date(blog.publishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</>
                )}
              </p>
              {blog.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {blog.tags.map(({ tag }) => (
                    <span key={tag.name} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">{tag.label}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No posts yet.</p>
      )}
    </main>
  )
}
