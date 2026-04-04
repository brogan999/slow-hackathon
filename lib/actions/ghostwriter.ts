"use server"

import { auth } from "@/auth"
import { generateEssay, type PipelineMode } from "@/lib/ghostwriter/generate"
import { scorePangram, type PangramScore } from "@/lib/ghostwriter/pangram"

export async function generateGhostwriterEssay(
  _prev: { text?: string; error?: string; score?: PangramScore; mode?: PipelineMode },
  formData: FormData
) {
  try {
    const session = await auth()
    if (!session) return { error: "Not authenticated" }

    const topic = formData.get("topic") as string
    if (!topic?.trim()) return { error: "Topic is required" }
    if (topic.trim().length < 200) return { error: "Topic brief must be at least 200 characters. More detail = better Pangram scores." }
    if (topic.length > 5000) return { error: "Topic is too long (max 5,000 characters)" }

    const mode = (formData.get("mode") as PipelineMode) || "corpus"
    const voiceId = (formData.get("voiceId") as string) || undefined
    const addSources = formData.get("addSources") === "on"

    console.log("[ghostwriter] Starting generation:", { mode, voiceId: voiceId || "default", addSources, topicLen: topic.trim().length })

    const { processed } = await generateEssay(topic.trim(), mode, voiceId, addSources)
    console.log("[ghostwriter] Generation complete, length:", processed.length)

    let score: PangramScore | undefined
    try {
      score = await scorePangram(processed)
    } catch (err) {
      console.error("[ghostwriter] Pangram scoring failed:", err)
    }

    return { text: processed, score, mode }
  } catch (err) {
    console.error("[ghostwriter] FATAL ERROR:", err)
    const message = err instanceof Error ? err.message : "Generation failed"
    return { error: message }
  }
}
