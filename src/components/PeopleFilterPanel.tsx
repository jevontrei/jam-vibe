"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface PeopleFilterPanelProps {
  instruments: string[]
  tags: { name: string; label: string }[]
  selectedInstruments: string[]
  selectedTags: string[]
}

export default function PeopleFilterPanel({
  instruments,
  tags,
  selectedInstruments,
  selectedTags,
}: PeopleFilterPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function toggle(type: "instrument" | "tag", value: string) {
    const params = new URLSearchParams(searchParams.toString())

    const existing = params.getAll(type)
    if (existing.includes(value)) {
      params.delete(type)
      existing.filter(v => v !== value).forEach(v => params.append(type, v))
    } else {
      params.append(type, value)
    }

    router.push(`/people?${params.toString()}`)
  }

  function clearFilters() {
    router.push("/people")
  }

  const hasFilters = selectedInstruments.length > 0 || selectedTags.length > 0

  return (
    <div className="mb-6 space-y-4">
      {instruments.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Instrument</p>
          <div className="flex flex-wrap gap-2">
            {instruments.map(name => {
              const active = selectedInstruments.includes(name)
              return (
                <button
                  key={name}
                  onClick={() => toggle("instrument", name)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Style</p>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ name, label }) => {
              const active = selectedTags.includes(name)
              return (
                <button
                  key={name}
                  onClick={() => toggle("tag", name)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-zinc-400 underline hover:text-zinc-600"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
