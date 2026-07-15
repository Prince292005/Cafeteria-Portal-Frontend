import { cn } from "@/lib/utils"

const palette = [
  "bg-terracotta text-primary-foreground",
  "bg-forest text-forest-foreground",
  "bg-espresso text-background",
  "bg-turmeric text-accent-foreground",
]

export function Monogram({
  name,
  className,
  index,
}: {
  name: string
  className?: string
  index?: number
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")
  const tone =
    palette[
      index !== undefined
        ? index % palette.length
        : name.charCodeAt(0) % palette.length
    ]
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-serif font-semibold select-none",
        tone,
        className,
      )}
      aria-hidden
    >
      {initials || "?"}
    </div>
  )
}
