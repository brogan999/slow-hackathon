export function getQuality(wordCount: number, sampleCount: number) {
  if (wordCount >= 10000 && sampleCount >= 5) return "excellent"
  if (wordCount >= 5000 && sampleCount >= 3) return "good"
  if (wordCount >= 2000) return "fair"
  return "poor"
}
