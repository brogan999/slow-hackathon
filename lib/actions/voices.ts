"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { extractFingerprint } from "@/lib/ghostwriter/fingerprint"
import { extractFromUrls, extractFromPdf, extractFromSubstack } from "@/lib/ghostwriter/extract"
import { revalidatePath } from "next/cache"

function computeCorpusStats(samples: string) {
  const wordCount = samples.split(/\s+/).filter(Boolean).length
  const pieces = samples.split(/\n---\n|\n\n\n/).filter((p) => p.trim().length > 200)
  const sampleCount = Math.max(pieces.length, 1)
  return { wordCount, sampleCount }
}

export function getQuality(wordCount: number, sampleCount: number) {
  if (wordCount >= 10000 && sampleCount >= 5) return "excellent"
  if (wordCount >= 5000 && sampleCount >= 3) return "good"
  if (wordCount >= 2000) return "fair"
  return "poor"
}

async function getSamplesFromForm(
  formData: FormData
): Promise<{ samples: string; sourceType: string }> {
  const source = (formData.get("source") as string) || "text"

  if (source === "substack") {
    const substackUrl = formData.get("substackUrl") as string
    if (!substackUrl?.trim()) throw new Error("Please enter a Substack URL")
    return { samples: await extractFromSubstack(substackUrl.trim()), sourceType: "substack" }
  }

  if (source === "url") {
    const urlsRaw = formData.get("urls") as string
    if (!urlsRaw?.trim()) throw new Error("Please enter at least one URL")
    const urls = urlsRaw.split("\n").filter((u) => u.trim())
    if (urls.length === 0) throw new Error("Please enter at least one URL")
    return { samples: await extractFromUrls(urls), sourceType: "url" }
  }

  if (source === "pdf") {
    const file = formData.get("pdf") as File | null
    if (!file || file.size === 0) throw new Error("Please upload a PDF file")
    const buffer = Buffer.from(await file.arrayBuffer())
    return { samples: await extractFromPdf(buffer), sourceType: "pdf" }
  }

  const samples = formData.get("samples") as string
  if (!samples?.trim()) throw new Error("Writing samples are required")
  return { samples: samples.trim(), sourceType: "text" }
}

export async function createVoice(
  _prev: { error?: string; success?: boolean; warning?: string },
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const name = formData.get("name") as string
  if (!name?.trim()) return { error: "Name is required" }

  try {
    const { samples, sourceType } = await getSamplesFromForm(formData)
    const { wordCount, sampleCount } = computeCorpusStats(samples)

    if (wordCount < 200) {
      return { error: `Only ${wordCount.toLocaleString()} words extracted. Need at least 500 words for a usable voice.` }
    }

    let warning: string | undefined
    if (wordCount < 2000) {
      warning = `Only ${wordCount.toLocaleString()} words extracted. The voice will work but adding more samples will improve quality.`
    }

    const fingerprint = await extractFingerprint(samples)

    await prisma.voice.create({
      data: {
        name: name.trim(),
        samples,
        fingerprint,
        wordCount,
        sampleCount,
        sourceType,
        userId: session.user.id,
      },
    })

    revalidatePath("/voices")
    revalidatePath("/ghostwriter")
    return { success: true, warning }
  } catch (err) {
    console.error("Voice creation failed:", err)
    const message = err instanceof Error ? err.message : "Failed to create voice"
    return { error: message }
  }
}

export async function listVoices() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.voice.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      wordCount: true,
      sampleCount: true,
      sourceType: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getVoice(voiceId: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.voice.findFirst({
    where: { id: voiceId, userId: session.user.id },
  })
}

export async function deleteVoice(
  _prev: { error?: string },
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const voiceId = formData.get("voiceId") as string
  if (!voiceId) return { error: "Voice ID is required" }

  await prisma.voice.deleteMany({
    where: { id: voiceId, userId: session.user.id },
  })

  revalidatePath("/voices")
  revalidatePath("/ghostwriter")
  return {}
}
