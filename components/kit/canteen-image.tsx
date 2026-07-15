import Image from "next/image"
import { cn } from "@/lib/utils"
import { resolveFileUrl } from "@/lib/api"
import type { Canteen } from "@/lib/types"

const accentBg: Record<Canteen["accent"], string> = {
  terracotta: "bg-terracotta text-primary-foreground",
  turmeric: "bg-turmeric text-accent-foreground",
  forest: "bg-forest text-forest-foreground",
  sky: "bg-sky text-primary-foreground",
  crimson: "bg-crimson text-primary-foreground",
  royal: "bg-royal text-primary-foreground",
  slate: "bg-slate text-primary-foreground",
}

/**
 * Renders a canteen's photo when one has been uploaded. If not, falls back
 * to a large letter monogram (first letter of the canteen name) on the
 * canteen's accent color, instead of a broken-looking generic image icon.
 */
export function CanteenImage({
  canteen,
  fill,
  sizes,
  priority,
  className,
  letterClassName,
}: {
  canteen: Pick<Canteen, "canteenName" | "imageUrl" | "accent">
  fill?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  letterClassName?: string
}) {
  if (!canteen.imageUrl) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center",
          accentBg[canteen.accent],
          className,
        )}
        aria-label={canteen.canteenName}
      >
        <span
          className={cn(
            "font-serif font-semibold leading-none select-none",
            letterClassName ?? "text-6xl",
          )}
        >
          {canteen.canteenName.trim().charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={resolveFileUrl(canteen.imageUrl)}
      alt={canteen.canteenName}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  )
}
