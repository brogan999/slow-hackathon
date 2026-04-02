import { extract } from "@extractus/article-extractor"
import { PDFParse } from "pdf-parse"

export async function extractFromUrl(url: string): Promise<string> {
  const article = await extract(url)
  if (!article?.content) {
    throw new Error(`Could not extract article content from ${url}`)
  }
  // Strip HTML tags from the content
  return article.content.replace(/<[^>]*>/g, "").trim()
}

export async function extractFromUrls(urls: string[]): Promise<string> {
  const results: string[] = []

  for (const url of urls) {
    const trimmed = url.trim()
    if (!trimmed) continue
    try {
      const text = await extractFromUrl(trimmed)
      if (text.length > 100) {
        results.push(text)
      }
    } catch (err) {
      console.error(`Failed to extract from ${trimmed}:`, err)
    }
  }

  if (results.length === 0) {
    throw new Error("Could not extract text from any of the provided URLs")
  }

  return results.join("\n\n---\n\n")
}

export async function extractFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  const result = await parser.getText()
  const text = result.text?.trim()
  if (!text) {
    throw new Error("Could not extract text from PDF")
  }
  return text
}
