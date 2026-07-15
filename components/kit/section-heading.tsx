import { Reveal } from "@/components/kit/reveal"

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string
  title: React.ReactNode
  description?: string
  align?: "left" | "center"
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-pretty text-lg leading-relaxed text-espresso/60">
          {description}
        </p>
      )}
    </Reveal>
  )
}
