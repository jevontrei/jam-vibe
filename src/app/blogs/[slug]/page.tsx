import { prisma } from "@/lib/prisma"
import TiptapRenderer from "@/components/TiptapRenderer"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const blog = await prisma.blog.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      content: true,
      publishedAt: true,
      createdBy: { select: { name: true } },
    },
  })

  if (!blog) notFound()

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link href="/blogs" className="text-sm text-zinc-400 hover:text-zinc-600">← Blogs</Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">{blog.title}</h1>

      <p className="mt-2 text-sm text-zinc-500">
        {blog.createdBy.name}
        {blog.publishedAt && (
          <> · {new Date(blog.publishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</>
        )}
      </p>

      <div className="mt-8">
        <TiptapRenderer content={blog.content} />
      </div>
    </main>
  )
}
