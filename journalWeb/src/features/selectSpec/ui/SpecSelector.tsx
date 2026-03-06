import type { Subject } from "@/entities/subject/model/types"
import { ChevronDown, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface Props {
  subjects: Subject[]
  selectedId: number | null
  onChange: (subject: Subject | null) => void
  loading?: boolean
}

export function SpecSelector({ subjects, selectedId, onChange, loading }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  const selected = subjects.find((s) => s.id === selectedId) ?? null
  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.short_name.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm transition-colors hover:bg-white/8"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Search size={14} className="text-[#6B7280] flex-shrink-0" />
          {loading ? (
            <span className="text-[#6B7280]">Загрузка предметов...</span>
          ) : selected ? (
            <span className="text-[#F2F2F2] truncate">{selected.name}</span>
          ) : (
            <span className="text-[#6B7280]">Все предметы</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {selected && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              className="p-0.5 text-[#6B7280] hover:text-[#F2F2F2] transition-colors"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`text-[#6B7280] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && !loading && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-[#2A2D32] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-2 border-b border-white/8">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl">
              <Search size={13} className="text-[#6B7280] flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Поиск предмета..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#F2F2F2] placeholder-[#6B7280] outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <X size={13} className="text-[#6B7280]" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); setSearch("") }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/5 ${
                !selectedId ? "text-[#0570f2] bg-white/5" : "text-[#9CA3AF] hover:bg-white/8"
              }`}
            >
              Все предметы
            </button>

            {filtered.length === 0 ? (
              <p className="text-[#6B7280] text-sm px-4 py-3">Не найдено</p>
            ) : (
              filtered.map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => { onChange(spec); setOpen(false); setSearch("") }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-0 ${
                    spec.id === selectedId
                      ? "text-[#0570f2] bg-white/5"
                      : "text-[#F2F2F2] hover:bg-white/8"
                  }`}
                >
                  <span className="block truncate">{spec.name}</span>
                  <span className="text-[10px] text-[#6B7280]">{spec.short_name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}