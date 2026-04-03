import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { anthropic } from "@ai-sdk/anthropic"
import { buildSystemPrompt, buildBasicSystemPrompt, buildUserPrompt, loadManidisVoice, type VoiceParams } from "./prompt"
import { perturbTokens } from "./perturbations"
import { addSourcesToEssay } from "./sources"
import { prisma } from "@/lib/db/prisma"

export type PipelineMode = "basic" | "corpus" | "opus"

const OPUS_REWRITE_PROMPT = `You are a post-processing engine. Your job is to take an essay and rewrite it so that AI detection tools (Pangram, GPTZero, Originality.ai) cannot identify it as machine-generated.

The essay you receive was written by Gemini, which has a STENOGRAPHIC PATTERN — a statistical fingerprint in its token distributions that detectors can identify. Your job is to DISRUPT that pattern while keeping the content, voice, and meaning identical.

WHAT TO DO:
1. VARY SENTENCE RHYTHM UNPREDICTABLY. If the original has three medium-length sentences in a row, break one into two short ones or combine two into one long one. The goal is burstiness — no two consecutive sentences should have similar length.

2. SWAP SYNONYMS NON-UNIFORMLY. Don't replace every instance of a word. Replace some, leave others. Inconsistency is human.

3. ADD COMMA VARIANCE. Humans are inconsistent with comma usage. Sometimes add an Oxford comma, sometimes don't. Sometimes use a comma before "and" in a compound sentence, sometimes don't.

4. INTRODUCE MICRO-IMPERFECTIONS. Add occasional:
   - A sentence that starts with "And" or "But" or "So"
   - A one-word sentence. Or two-word.
   - A parenthetical aside that doesn't quite connect
   - A self-correction ("Actually, that's not quite right —")
   - An em dash where a period could go

5. BREAK REPEATING CADENCE. If the essay falls into any rhythmic pattern (e.g., statement-evidence-analysis repeating), disrupt it. Insert a tangent. Skip the evidence sometimes. Lead with the analysis.

6. REDISTRIBUTE PARAGRAPH LENGTHS. If paragraphs are all roughly the same length, make some very short (1-2 sentences) and some longer (5-6 sentences).

WHAT NOT TO DO:
- Do NOT change the meaning, arguments, or factual claims
- Do NOT add new content or remove existing points
- Do NOT use these words: crucial, comprehensive, facilitate, leverage, robust, utilize, paradigm, landscape, ecosystem, tapestry, delve, realm, nuanced, multifaceted, moreover, furthermore, additionally, notably, importantly, interestingly, fundamentally, ultimately
- Do NOT make the writing worse — it should still read as polished, opinionated newsletter writing
- Do NOT add any commentary, notes, or explanation. Output ONLY the rewritten essay.

The goal: the rewritten essay should score LOWER on AI detection than the input, while reading identically to a human reader.`

function assertGoogleKey() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to your .env file.")
  }
}

async function callGemini(systemPrompt: string, topic: string): Promise<string> {
  assertGoogleKey()
  const { text } = await generateText({
    model: google("gemini-3.1-pro-preview"),
    system: systemPrompt,
    prompt: buildUserPrompt(topic),
    maxOutputTokens: 65536,
    temperature: 0.95,
    topP: 0.95,
  })
  return text
}

async function opusRewrite(text: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it to your .env file.")
  }
  const { text: rewritten } = await generateText({
    model: anthropic("claude-opus-4-6"),
    system: OPUS_REWRITE_PROMPT,
    prompt: text,
    maxOutputTokens: 16384,
    temperature: 1.0,
  })
  return rewritten
}

async function loadVoice(voiceId: string): Promise<VoiceParams | undefined> {
  const voice = await prisma.voice.findUnique({
    where: { id: voiceId },
    select: { fingerprint: true, samples: true },
  })
  if (!voice) return undefined
  return { fingerprint: voice.fingerprint, samples: voice.samples }
}

export async function generateEssay(
  topic: string,
  mode: PipelineMode = "corpus",
  voiceId?: string,
  addSources = true
): Promise<{ raw: string; processed: string }> {
  const voice = voiceId === "manidis"
    ? loadManidisVoice()
    : voiceId
      ? await loadVoice(voiceId)
      : undefined

  let raw: string

  if (mode === "basic") {
    raw = await callGemini(buildBasicSystemPrompt(voice), topic)
  } else {
    raw = await callGemini(buildSystemPrompt(voice), topic)
  }

  let processed = perturbTokens(raw, 0.8)

  if (mode === "opus") {
    processed = await opusRewrite(processed)
  }

  if (addSources) {
    try {
      processed = await addSourcesToEssay(processed)
    } catch (err) {
      console.error("Source addition failed (continuing without):", err)
    }
  }

  return { raw, processed }
}
