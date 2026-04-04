import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const results: Record<string, string> = {}

  try {
    await import("@/auth")
    results.auth = "ok"
  } catch (e: any) {
    results.auth = e.message
  }

  try {
    await import("@/lib/ghostwriter/generate")
    results.generate = "ok"
  } catch (e: any) {
    results.generate = e.message
  }

  try {
    await import("@/lib/ghostwriter/pangram")
    results.pangram = "ok"
  } catch (e: any) {
    results.pangram = e.message
  }

  try {
    await import("@/lib/ghostwriter/prompt")
    results.prompt = "ok"
  } catch (e: any) {
    results.prompt = e.message
  }

  try {
    await import("@/lib/ghostwriter/sources")
    results.sources = "ok"
  } catch (e: any) {
    results.sources = e.message
  }

  try {
    await import("@/lib/ghostwriter/corpus")
    results.corpus = "ok"
  } catch (e: any) {
    results.corpus = e.message
  }

  try {
    await import("@/lib/ghostwriter/extract")
    results.extract = "ok"
  } catch (e: any) {
    results.extract = e.message
  }

  try {
    await import("@/lib/ghostwriter/perturbations")
    results.perturbations = "ok"
  } catch (e: any) {
    results.perturbations = e.message
  }

  return NextResponse.json(results)
}
