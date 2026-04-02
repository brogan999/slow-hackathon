import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { buildSystemPrompt, buildUserPrompt } from "./prompt"
import { perturbTokens } from "./perturbations"

export async function generateEssay(
  topic: string
): Promise<{ raw: string; processed: string }> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to your .env file."
    )
  }

  const { text } = await generateText({
    model: google("gemini-3.1-pro-preview"),
    system: buildSystemPrompt(),
    prompt: buildUserPrompt(topic),
    maxOutputTokens: 65536,
    temperature: 0.95,
    topP: 0.95,
  })

  const processed = perturbTokens(text, 0.8)

  return { raw: text, processed }
}
