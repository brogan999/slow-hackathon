const PANGRAM_API_KEY = "b77d6bc6-6014-4fa7-abd5-7d1733fd2587"
const PANGRAM_API_URL = "https://text.api.pangram.com/v3"

export type PangramScore = {
  fractionAi: number
  headline: string
  maxScore: number
  passing: boolean
  numFlagged: number
  numTotal: number
}

export async function scorePangram(text: string): Promise<PangramScore> {
  const res = await fetch(PANGRAM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": PANGRAM_API_KEY,
    },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    throw new Error(`Pangram API error: ${res.status}`)
  }

  const data = await res.json()

  const windows: Array<{ ai_assistance_score?: number }> = data.windows ?? []
  const fractionAi: number = data.fraction_ai ?? 0
  const headline: string = data.headline ?? "?"

  const flagged = windows.filter((w) => (w.ai_assistance_score ?? 0) > 0.3)
  const maxScore = Math.max(
    ...windows.map((w) => w.ai_assistance_score ?? 0),
    0
  )

  return {
    fractionAi,
    headline,
    maxScore,
    passing: fractionAi <= 0.25,
    numFlagged: flagged.length,
    numTotal: windows.length,
  }
}
