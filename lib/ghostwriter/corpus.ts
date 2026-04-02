import fs from "fs"
import path from "path"

const CORPUS_DIR = path.join(process.cwd(), "data", "corpus")
const MIN_WORD_COUNT = 100

const MANIFESTO_SLUGS = [
  "us-against-spacetime",
  "most-human-wins",
  "means-and-meaning",
  "costless-sacrifice",
  "everything-is-technology",
]

export type Essay = {
  slug: string
  title: string
  content: string
  wordCount: number
  isManifesto: boolean
}

export type ScoredParagraph = {
  score: number
  text: string
  essayTitle: string
}

export function loadCorpus(): Essay[] {
  const files = fs
    .readdirSync(CORPUS_DIR)
    .filter((f) => f.endsWith(".md"))

  const essays: Essay[] = []

  for (const file of files) {
    const slug = file.replace(".md", "")
    const raw = fs.readFileSync(path.join(CORPUS_DIR, file), "utf-8")

    let content = raw
    if (raw.startsWith("---")) {
      const parts = raw.split("---", 3)
      if (parts.length >= 3) {
        content = parts[2].trim()
      }
    }

    const wordCount = content.split(/\s+/).length
    if (wordCount < MIN_WORD_COUNT) continue

    let title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    if (raw.startsWith("---")) {
      const frontmatter = raw.split("---", 3)[1]
      for (const line of frontmatter.split("\n")) {
        if (line.trim().startsWith("title:")) {
          title = line.split(":", 2)[1].trim().replace(/^["']|["']$/g, "")
          break
        }
      }
    }

    essays.push({
      slug,
      title,
      content,
      wordCount,
      isManifesto: MANIFESTO_SLUGS.includes(slug),
    })
  }

  essays.sort((a, b) => {
    if (a.isManifesto !== b.isManifesto) return a.isManifesto ? -1 : 1
    return b.wordCount - a.wordCount
  })

  return essays
}

export function extractBestParagraphs(
  essays: Essay[],
  count = 60
): ScoredParagraph[] {
  const candidates: ScoredParagraph[] = []

  for (const essay of essays) {
    const paras = essay.content
      .split("\n\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 150)

    for (const p of paras) {
      const words = p.split(/\s+/).length
      if (words <= 30 || words >= 200) continue

      const hasProper = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/.test(p)
      const sentences = p.split(/[.!?]+/).filter((s) => s.trim())
      const lengths = sentences.map((s) => s.trim().split(/\s+/).length)
      const lengthVariance =
        lengths.length > 1 ? Math.max(...lengths) - Math.min(...lengths) : 0
      const isList = /^[-*•]|^1\./.test(p.trim())

      let score =
        (hasProper ? 10 : 0) + lengthVariance + (isList ? 0 : 5)
      if (essay.isManifesto) score += 20

      candidates.push({ score, text: p, essayTitle: essay.title })
    }
  }

  candidates.sort((a, b) => b.score - a.score)
  return candidates.slice(0, count)
}
