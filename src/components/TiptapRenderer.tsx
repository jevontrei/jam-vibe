import { type ReactNode } from "react"

type Mark = { type: string; attrs?: Record<string, string> }
type Node = {
  type: string
  text?: string
  attrs?: Record<string, string | number>
  marks?: Mark[]
  content?: Node[]
}

function applyMarks(text: string, marks: Mark[] = []): ReactNode {
  return marks.reduce<ReactNode>((node, mark) => {
    switch (mark.type) {
      case "bold": return <strong>{node}</strong>
      case "italic": return <em>{node}</em>
      case "code": return <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm">{node}</code>
      case "link": return (
        <a href={mark.attrs?.href} target="_blank" rel="noopener noreferrer"
          className="underline hover:text-zinc-900">
          {node}
        </a>
      )
      default: return node
    }
  }, text)
}

function renderNode(node: Node, key: number): ReactNode {
  switch (node.type) {
    case "doc":
      return <>{node.content?.map((n, i) => renderNode(n, i))}</>

    case "paragraph":
      return (
        <p key={key} className="mt-4 leading-relaxed text-zinc-700">
          {node.content?.map((n, i) => renderNode(n, i))}
        </p>
      )

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2
      const children = node.content?.map((n, i) => renderNode(n, i))
      const cls = level === 1
        ? "mt-8 text-xl font-bold text-zinc-900"
        : level === 2
          ? "mt-8 text-lg font-semibold text-zinc-900"
          : "mt-6 font-semibold text-zinc-800"
      if (level === 1) return <h1 key={key} className={cls}>{children}</h1>
      if (level === 2) return <h2 key={key} className={cls}>{children}</h2>
      if (level === 3) return <h3 key={key} className={cls}>{children}</h3>
      return <h4 key={key} className={cls}>{children}</h4>
    }

    case "bulletList":
      return (
        <ul key={key} className="mt-4 list-disc pl-6 space-y-1 text-zinc-700">
          {node.content?.map((n, i) => renderNode(n, i))}
        </ul>
      )

    case "orderedList":
      return (
        <ol key={key} className="mt-4 list-decimal pl-6 space-y-1 text-zinc-700">
          {node.content?.map((n, i) => renderNode(n, i))}
        </ol>
      )

    case "listItem":
      return (
        <li key={key}>
          {node.content?.map((n, i) => renderNode(n, i))}
        </li>
      )

    case "blockquote":
      return (
        <blockquote key={key} className="mt-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600">
          {node.content?.map((n, i) => renderNode(n, i))}
        </blockquote>
      )

    case "hardBreak":
      return <br key={key} />

    case "text":
      return <span key={key}>{applyMarks(node.text ?? "", node.marks)}</span>

    default:
      return null
  }
}

export default function TiptapRenderer({ content }: { content: unknown }) {
  return (
    <div className="prose-zinc">
      {renderNode(content as Node, 0)}
    </div>
  )
}
