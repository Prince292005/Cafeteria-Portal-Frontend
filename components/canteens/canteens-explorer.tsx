"use client"

import { useMemo, useState } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { useCanteens } from "@/lib/mock/store"
import { CanteenCard } from "./canteen-card"
import { cn } from "@/lib/utils"

type SortKey = "rating" | "name" | "price"

export function CanteensExplorer() {
  const canteens = useCanteens()
  const [query, setQuery] = useState("")
  const [cuisine, setCuisine] = useState("All")
  const [sort, setSort] = useState<SortKey>("rating")

  const cuisines = useMemo(
    () => ["All", ...Array.from(new Set(canteens.map((c) => c.cuisine)))],
    [canteens],
  )

  const filtered = useMemo(() => {
    let list = canteens.filter((c) => {
      const q = query.trim().toLowerCase()
      const matchQ =
        !q ||
        c.canteenName.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.cuisine.toLowerCase().includes(q)
      const matchC = cuisine === "All" || c.cuisine === cuisine
      return matchQ && matchC
    })
    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating
      if (sort === "price") return a.priceLevel - b.priceLevel
      return a.canteenName.localeCompare(b.canteenName)
    })
    return list
  }, [canteens, query, cuisine, sort])

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-3xl border border-espresso/10 bg-card p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search canteens, cuisines, dishes..."
            className="w-full rounded-2xl border border-espresso/10 bg-background py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-terracotta"
          />
        </div>
        {cuisines.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto">
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setCuisine(c)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                  cuisine === c
                    ? "border-terracotta bg-terracotta text-background"
                    : "border-espresso/15 text-espresso/70 hover:border-terracotta/40",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 border-espresso/10 md:border-l md:pl-3">
          <SlidersHorizontal className="h-4 w-4 text-espresso/40" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-xl border border-espresso/10 bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-terracotta"
          >
            <option value="rating">Top rated</option>
            <option value="name">Name (A–Z)</option>
            <option value="price">Price (low → high)</option>
          </select>
        </div>
      </div>

      <p className="mt-6 text-sm text-espresso/55">
        Showing <span className="font-semibold text-espresso">{filtered.length}</span> of{" "}
        {canteens.length} canteens
      </p>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <CanteenCard key={c.id} canteen={c} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-espresso/20 p-12 text-center">
          <p className="font-serif text-xl">No canteens match that search.</p>
          <p className="mt-1 text-sm text-espresso/55">Try a different cuisine or keyword.</p>
        </div>
      )}
    </div>
  )
}
