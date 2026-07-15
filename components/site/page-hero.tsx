import type { ReactNode } from "react"

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  children?: ReactNode
}) {
  return (
    <section className="border-b border-espresso/10 bg-gradient-to-b from-cream to-background">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl text-balance font-serif text-4xl font-semibold leading-[1.05] md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-espresso/60 md:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}
