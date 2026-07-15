import AdmZip from "adm-zip"
import { readdirSync, statSync, mkdirSync } from "node:fs"
import { join } from "node:path"

const ROOT = process.cwd()
const OUT_DIR = join(ROOT, "public", "downloads")
const OUT_FILE = join(OUT_DIR, "cafeteria-portal-frontend.zip")

// Top-level entries to include in the archive
const INCLUDE = [
  "app",
  "components",
  "lib",
  "public/images",
  "components.json",
  "next.config.mjs",
  "next-env.d.ts",
  "package.json",
  "postcss.config.mjs",
  "tsconfig.json",
  ".gitignore",
]

// Never include these directories anywhere in the tree
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "downloads"])

const zip = new AdmZip()

function addPath(absPath, zipPath) {
  const st = statSync(absPath)
  if (st.isDirectory()) {
    const base = absPath.split("/").pop()
    if (SKIP_DIRS.has(base)) return
    for (const entry of readdirSync(absPath)) {
      addPath(join(absPath, entry), `${zipPath}/${entry}`)
    }
  } else {
    zip.addLocalFile(absPath, zipPath.split("/").slice(0, -1).join("/"))
  }
}

let count = 0
for (const rel of INCLUDE) {
  const abs = join(ROOT, rel)
  try {
    statSync(abs)
  } catch {
    console.log(`[skip missing] ${rel}`)
    continue
  }
  const parent = rel.includes("/") ? rel.split("/").slice(0, -1).join("/") : ""
  addPath(abs, rel)
  count++
}

mkdirSync(OUT_DIR, { recursive: true })
zip.writeZip(OUT_FILE)
console.log(`Wrote ${OUT_FILE}`)
console.log(`Included ${count} top-level entries, ${zip.getEntries().length} files total.`)
