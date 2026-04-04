import { NextResponse } from "next/server"

export async function GET() {
  const results: string[] = []

  try { await import("@/auth"); results.push("auth:ok") } catch (e) { results.push("auth:" + (e instanceof Error ? e.message : String(e))) }
  try { await import("@/lib/ghostwriter/generate"); results.push("generate:ok") } catch (e) { results.push("generate:" + (e instanceof Error ? e.message : String(e))) }
  try { await import("@/lib/ghostwriter/pangram"); results.push("pangram:ok") } catch (e) { results.push("pangram:" + (e instanceof Error ? e.message : String(e))) }
  try { await import("@/lib/ghostwriter/prompt"); results.push("prompt:ok") } catch (e) { results.push("prompt:" + (e instanceof Error ? e.message : String(e))) }
  try { await import("@/lib/ghostwriter/sources"); results.push("sources:ok") } catch (e) { results.push("sources:" + (e instanceof Error ? e.message : String(e))) }
  try { await import("@/lib/ghostwriter/corpus"); results.push("corpus:ok") } catch (e) { results.push("corpus:" + (e instanceof Error ? e.message : String(e))) }
  try { await import("@/lib/ghostwriter/extract"); results.push("extract:ok") } catch (e) { results.push("extract:" + (e instanceof Error ? e.message : String(e))) }

  return NextResponse.json({ results })
}
