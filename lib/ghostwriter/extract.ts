import { extract } from "@extractus/article-extractor"
import { PDFParse } from "pdf-parse"

function htmlToText(html: string): string {
  let text = html
  // Convert block elements to double newlines
  text = text.replace(/<\/(p|div|article|section|blockquote|h[1-6]|li|tr)>/gi, "\n\n")
  text = text.replace(/<br\s*\/?>/gi, "\n")
  // Strip remaining HTML tags
  text = text.replace(/<[^>]*>/g, "")
  // Decode common HTML entities
  text = text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  text = text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
  text = text.replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/")
  // Clean up whitespace: collapse multiple newlines to double, trim lines
  text = text.replace(/[ \t]+/g, " ")
  text = text.replace(/\n /g, "\n")
  text = text.replace(/\n{3,}/g, "\n\n")
  return text.trim()
}

export async function extractFromUrl(url: string): Promise<string> {
  const article = await extract(url)
  if (!article?.content) {
    throw new Error(`Could not extract article content from ${url}`)
  }
  return htmlToText(article.content)
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

export async function extractFromSubstack(substackUrl: string): Promise<string> {
  // Normalize URL — strip common trailing paths users might paste
  let baseUrl = substackUrl.trim().replace(/\/+$/, "")
  if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`
  baseUrl = baseUrl.replace(/\/(archive|about|subscribe|p\/.*|podcast|recommendations)$/i, "")

  // Fetch sitemap to discover all post URLs
  const sitemapUrl = `${baseUrl}/sitemap.xml`
  const sitemapRes = await fetch(sitemapUrl)
  if (!sitemapRes.ok) {
    throw new Error(`Could not fetch sitemap from ${sitemapUrl} (${sitemapRes.status})`)
  }

  const sitemapXml = await sitemapRes.text()

  // Check for nested sitemaps (Substack sometimes uses sitemap index)
  const nestedSitemaps = [...sitemapXml.matchAll(/<loc>(.*?sitemap.*?\.xml.*?)<\/loc>/gi)]
    .map((m) => m[1].trim())

  let allXml = sitemapXml
  for (const nested of nestedSitemaps) {
    try {
      const nestedRes = await fetch(nested)
      if (nestedRes.ok) {
        allXml += "\n" + (await nestedRes.text())
      }
    } catch {
      // skip failed nested sitemaps
    }
  }

  // Extract all post URLs (Substack posts have /p/ in the path)
  const postUrls = [...allXml.matchAll(/<loc>(.*?\/p\/.*?)<\/loc>/gi)]
    .map((m) => m[1].trim())
    .filter((url, i, arr) => arr.indexOf(url) === i) // dedupe

  if (postUrls.length === 0) {
    throw new Error("No posts found in the Substack sitemap. Make sure the URL is correct.")
  }

  // Scrape posts (cap at 50 to avoid hammering)
  const maxPosts = Math.min(postUrls.length, 50)
  const results: string[] = []
  let scraped = 0

  for (let i = 0; i < maxPosts; i++) {
    try {
      const text = await extractFromUrl(postUrls[i])
      if (text.length > 200) {
        results.push(text)
        scraped++
      }
    } catch (err) {
      console.error(`Failed to scrape ${postUrls[i]}:`, err)
    }

    // Small delay to be polite
    if (i < maxPosts - 1) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  if (results.length === 0) {
    throw new Error("Could not extract text from any Substack posts")
  }

  console.log(`Scraped ${scraped}/${postUrls.length} posts from ${baseUrl}`)
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
