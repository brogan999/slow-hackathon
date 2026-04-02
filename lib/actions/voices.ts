"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { extractFingerprint } from "@/lib/ghostwriter/fingerprint"
import { revalidatePath } from "next/cache"

export async function createVoice(
  _prev: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const name = formData.get("name") as string
  const samples = formData.get("samples") as string

  if (!name?.trim()) return { error: "Name is required" }
  if (!samples?.trim()) return { error: "Writing samples are required" }
  if (samples.length < 500) return { error: "Please provide at least 500 characters of writing samples" }

  try {
    const fingerprint = await extractFingerprint(samples.trim())

    await prisma.voice.create({
      data: {
        name: name.trim(),
        samples: samples.trim(),
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
