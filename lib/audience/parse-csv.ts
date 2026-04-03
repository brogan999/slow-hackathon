const PERSONAL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
  "aol.com", "mail.com", "protonmail.com", "zoho.com", "yandex.com",
  "gmx.com", "live.com", "msn.com", "me.com", "mac.com", "fastmail.com",
  "tutanota.com", "pm.me", "yahoo.co.uk", "yahoo.co.in", "yahoo.fr",
  "hotmail.co.uk", "hotmail.fr", "outlook.fr", "googlemail.com",
  "ymail.com", "rocketmail.com", "inbox.com", "mail.ru",
])

export type ParsedContact = {
  email: string
  emailDomain: string
  isWorkEmail: boolean
  source: string | null
  subscribedOn: Date | null
}

export function isWorkEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase()
  if (!domain) return false
  return !PERSONAL_DOMAINS.has(domain)
}

export function parseCsv(csvText: string): ParsedContact[] {
  const lines = csvText.split("\n").filter((l) => l.trim())
  if (lines.length < 2) return []

  const header = lines[0].toLowerCase()
  const columns = header.split(",").map((c) => c.trim().replace(/"/g, ""))

  const emailIdx = columns.findIndex((c) => c === "email")
  if (emailIdx === -1) return []

  const sourceIdx = columns.findIndex(
    (c) => c.includes("acquisition") || c.includes("source")
  )
  const dateIdx = columns.findIndex(
    (c) => c.includes("created") || c.includes("subscribed") || c === "created_at"
  )

  const contacts: ParsedContact[] = []
  const seen = new Set<string>()

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const email = values[emailIdx]?.trim().toLowerCase().replace(/"/g, "")
    if (!email || !email.includes("@")) continue
    if (seen.has(email)) continue
    seen.add(email)

    const domain = email.split("@")[1]
    const source = sourceIdx >= 0 ? values[sourceIdx]?.trim().replace(/"/g, "") || null : null
    const dateStr = dateIdx >= 0 ? values[dateIdx]?.trim().replace(/"/g, "") : null
    const subscribedOn = dateStr ? new Date(dateStr) : null

    contacts.push({
      email,
      emailDomain: domain,
      isWorkEmail: isWorkEmail(email),
      source,
      subscribedOn: subscribedOn && !isNaN(subscribedOn.getTime()) ? subscribedOn : null,
    })
  }

  return contacts
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}
