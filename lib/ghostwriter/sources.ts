import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import Exa from "exa-js"

export type Source = {
  claim: string
  title: string
  url: string
  author: string | null
  publishedDate: string | null
}

export async function extractClaims(essay: string): Promise<string[]> {
  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You identify factual claims in essays that need sources. For each claim, output a short search query that would find the best source for it. Output ONLY a JSON array of strings — no commentary, no markdown fences, just the array.

Focus on:
- Historical facts and dates
- Statistics and numbers
- Quotes or attributed statements
- Company/product claims (funding rounds, user counts, acquisitions)
- Scientific or academic claims
- Named people and what they did

Skip:
- Opinions and arguments (these don't need sources)
- Common knowledge ("the sky is blue")
- The author's own experiences

Return 5-15 claims maximum. Pick the most important ones.`,
    prompt: essay,
    maxOutputTokens: 2048,
    temperature: 0,
  })

  try {
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
    const claims = JSON.parse(cleaned)
    if (Array.isArray(claims)) return claims.slice(0, 15)
  } catch {
    console.error("Failed to parse claims JSON:", text.slice(0, 200))
  }
  return []
}

export async function searchSources(claims: string[]): Promise<Source[]> {
  if (!process.env.EXA_API_KEY) {
    throw new Error("EXA_API_KEY is not set.")
  }

  const exa = new Exa(process.env.EXA_API_KEY)
  const sources: Source[] = []

  for (const claim of claims) {
    try {
      const result = await exa.search(claim, {
        numResults: 1,
        type: "auto",
      })

      if (result.results.length > 0) {
        const r = result.results[0]
        sources.push({
          claim,
          title: r.title || "Untitled",
          url: r.url,
          author: r.author || null,
          publishedDate: r.publishedDate || null,
        })
      }
    } catch (err) {
      console.error(`Exa search failed for "${claim}":`, err)
    }
  }

  return sources
}

export async function insertFootnotes(
  essay: string,
  sources: Source[]
): Promise<string> {
  if (sources.length === 0) return essay

  const sourceList = sources
    .map((s, i) => `[^${i + 1}]: Claim: "${s.claim}" → Source: ${s.title} (${s.url})${s.author ? ` by ${s.author}` : ""}${s.publishedDate ? `, ${s.publishedDate}` : ""}`)
    .join("\n")

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You insert footnote markers into an essay. You receive an essay and a list of sources with their claims.

For each source, find the sentence in the essay that makes that claim and add a footnote marker [^N] at the end of the sentence.

Then append a footnotes section at the very bottom of the essay.

Rules:
- Only insert markers — do NOT change any other text in the essay
- Each footnote in the footer should be formatted as: [^N]: Title. Author (if available). URL
- If you can't find where a claim appears in the text, skip that footnote
- Output the complete essay with markers inserted and footnotes appended
- No commentary — output ONLY the modified essay`,
    prompt: `ESSAY:
${essay}

SOURCES:
${sourceList}`,
    maxOutputTokens: 16384,
    temperature: 0,
  })

  return text
}

export async function addSourcesToEssay(essay: string): Promise<string> {
  const claims = await extractClaims(essay)
  if (claims.length === 0) return essay

  const sources = await searchSources(claims)
  if (sources.length === 0) return essay

  return insertFootnotes(essay, sources)
}
