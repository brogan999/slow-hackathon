import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const FINGERPRINT_PROMPT = `# PRODUCE A VOICE FINGERPRINT

Analyze the writing samples above and produce a precise, technical voice fingerprint. Cover:

1. SENTENCE PATTERNS: What is the actual distribution of sentence lengths? Give specific examples of short sentences (<5 words) and long sentences (>30 words) that are characteristic. What percentage are fragments vs. complete sentences?

2. PARAGRAPH PATTERNS: How long are typical paragraphs? How often are one-sentence paragraphs used? What triggers a paragraph break?

3. VOCABULARY FINGERPRINT: List 30-40 words and phrases this author uses frequently that are distinctive. List 20 words a typical AI would use that this author NEVER uses.

4. OPENING MOVES: Catalog exactly how each piece opens. What are the 3-4 archetypes?

5. TRANSITION PATTERNS: How does the author move between ideas? What connective words/phrases are used vs. avoided?

6. PUNCTUATION HABITS: Em dashes, parentheses, colons, semicolons — usage frequency and patterns.

7. REGISTER SHIFTS: Document specific examples where the author shifts between high and low register within a single paragraph.

8. RHETORICAL DEVICES: What specific devices does this author use that would be hard for an AI to replicate? (e.g., direct address to reader, self-interruption, meta-commentary)

9. WHAT MAKES THIS VOICE UNUSUAL: What would a perplexity-based AI detector flag as "human" about this writing? What patterns break the expected token distribution of an LLM?

Be extremely specific. Quote exact phrases. This fingerprint will be used to write new text that is indistinguishable from this author's work.`

export async function extractFingerprint(samples: string): Promise<string> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set.")
  }

  const prompt = `# TASK: VOICE FINGERPRINT EXTRACTION

You are a literary analyst. Read the following writing samples by the same author and produce a detailed VOICE FINGERPRINT — a precise technical description of how this author writes, focusing on patterns that distinguish them from AI-generated text.

=== WRITING SAMPLES ===

${samples}

=== END SAMPLES ===

${FINGERPRINT_PROMPT}`

  const { text } = await generateText({
    model: google("gemini-3.1-pro-preview"),
    prompt,
    maxOutputTokens: 8192,
    temperature: 0.7,
  })

  return text
}
