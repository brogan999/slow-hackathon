"use server"

import { auth } from "@/auth"
import { generateEssay } from "@/lib/ghostwriter/generate"

export async function generateGhostwriterEssay(
  _prev: { text?: string; error?: string },
  formData: FormData
) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const topic = formData.get("topic") as string
  if (!topic?.trim()) return { error: "Topic is required" }
  if (topic.length > 5000) return { error: "Topic is too long (max 5,000 characters)" }

  try {
    const { processed } = await generateEssay(topic.trim())
    return { text: processed }
  } catch (err) {
    console.error("Ghostwriter generation failed:", err)
    const message = err instanceof Error ? err.message : "Generation failed"
    return { error: message }
  }
}
