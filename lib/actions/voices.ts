"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { extractFingerprint } from "@/lib/ghostwriter/fingerprint"
import { extractFromUrls, extractFromPdf } from "@/lib/ghostwriter/extract"
import { revalidatePath } from "next/cache"

async function getSamplesFromForm(
  formData: FormData
): Promise<string> {
  const source = (formData.get("source") as string) || "text"

  if (source === "url") {
    const urlsRaw = formData.get("urls") as string
    if (!urlsRaw?.trim()) throw new Error("Please enter at least one URL")
    const urls = urlsRaw.split("\n").filter((u) => u.trim())
    if (urls.length === 0) throw new Error("Please enter at least one URL")
    return extractFromUrls(urls)
  }

  if (source === "pdf") {
    const file = formData.get("pdf") as File | null
    if (!file || file.size === 0) throw new Error("Please upload a PDF file")
    const buffer = Buffer.from(await file.arrayBuffer())
    return extractFromPdf(buffer)
  }

  // Default: text
  const samples = formData.get("samples") as string
  if (!samples?.trim()) throw new Error("Writing samples are required")
  return samples.trim()
}

export async function createVoice(
  _prev: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const name = formData.get("name") as string
  if (!name?.trim()) return { error: "Name is required" }

  try {
    const samples = await getSamplesFromForm(formData)

    if (samples.length < 500) {
      return { error: "Not enough text extracted. Need at least 500 characters of writing samples." }
    }

    const fingerprint = await extractFingerprint(samples)

    await prisma.voice.create({
      data: {
        name: name.trim(),
        samples,
        fingerprint,
        userId: session.user.id,
      },
    })

    revalidatePath("/voices")
    revalidatePath("/ghostwriter")
    return { success: true }
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
    select: { id: true, name: true, createdAt: true, samples: true },
    orderBy: { createdAt: "desc" },
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
