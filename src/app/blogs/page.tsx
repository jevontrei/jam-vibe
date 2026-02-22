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
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">No posts yet.</p>
      )}
    </main>
  )
}
