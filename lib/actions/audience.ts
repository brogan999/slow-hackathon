"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { parseCsv } from "@/lib/audience/parse-csv"
import { revalidatePath } from "next/cache"

export async function importCsv(
  _prev: { error?: string; imported?: number; workEmails?: number },
  formData: FormData
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const file = formData.get("csv") as File | null
  if (!file || file.size === 0) return { error: "Please upload a CSV file" }

  try {
    const text = await file.text()
    const contacts = parseCsv(text)

    if (contacts.length === 0) {
      return { error: "No valid emails found in CSV. Make sure it has an 'email' column." }
    }

    let imported = 0
    const batchSize = 100

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize)

      for (const contact of batch) {
        try {
          await prisma.contact.upsert({
            where: {
              email_userId: {
                email: contact.email,
                userId: session.user.id,
              },
            },
            update: {
              source: contact.source,
              subscribedOn: contact.subscribedOn,
            },
            create: {
              email: contact.email,
              emailDomain: contact.emailDomain,
              isWorkEmail: contact.isWorkEmail,
              source: contact.source,
              subscribedOn: contact.subscribedOn,
              userId: session.user.id,
            },
          })
          imported++
        } catch {
          // skip duplicates or invalid rows
        }
      }
    }

    const workEmails = contacts.filter((c) => c.isWorkEmail).length

    revalidatePath("/audience")
    return { imported, workEmails }
  } catch (err) {
    console.error("CSV import failed:", err)
    const message = err instanceof Error ? err.message : "Import failed"
    return { error: message }
  }
}

export async function getAudienceStats() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [total, workEmails, topDomains] = await Promise.all([
    prisma.contact.count({ where: { userId: session.user.id } }),
    prisma.contact.count({ where: { userId: session.user.id, isWorkEmail: true } }),
    prisma.contact.groupBy({
      by: ["emailDomain"],
      where: { userId: session.user.id, isWorkEmail: true },
      _count: { emailDomain: true },
      orderBy: { _count: { emailDomain: "desc" } },
      take: 20,
    }),
  ])

  return {
    total,
    workEmails,
    personalEmails: total - workEmails,
    topDomains: topDomains.map((d) => ({
      domain: d.emailDomain,
      count: d._count.emailDomain,
    })),
  }
}

export async function getWorkContacts(page = 1, perPage = 50) {
  const session = await auth()
  if (!session?.user?.id) return { contacts: [], total: 0 }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where: { userId: session.user.id, isWorkEmail: true },
      orderBy: [{ emailDomain: "asc" }, { email: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.contact.count({
      where: { userId: session.user.id, isWorkEmail: true },
    }),
  ])

  return { contacts, total }
}
