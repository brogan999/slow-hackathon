"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { importCsv, getAudienceStats, getWorkContacts } from "@/lib/actions/audience"
import { useActionState } from "react"
import { useEffect, useState } from "react"
import { Upload, Users, Briefcase, Mail, Globe } from "lucide-react"
import Link from "next/link"

type Stats = {
  total: number
  workEmails: number
  personalEmails: number
  topDomains: { domain: string; count: number }[]
}

type Contact = {
  id: string
  email: string
  emailDomain: string
  source: string | null
  subscribedOn: string | null
  name: string | null
  title: string | null
  company: string | null
}

export default function AudiencePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [totalWork, setTotalWork] = useState(0)

  const [state, action, pending] = useActionState<
    { error?: string; imported?: number; workEmails?: number },
    FormData
  >(
    async (_prev, formData) => {
      const result = await importCsv(_prev, formData)
      if (result?.imported) {
        loadData()
      }
      return result ?? {}
    },
    {}
  )

  async function loadData() {
    const [s, c] = await Promise.all([
      getAudienceStats(),
      getWorkContacts(1, 100),
    ])
    if (s) setStats(s)
    if (c) {
      setContacts(c.contacts as Contact[])
      setTotalWork(c.total)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pt-12 gap-6">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Audience</CardTitle>
            <CardDescription>
              Import your Beehiiv subscriber export. Work emails are
              automatically identified for enrichment.
            </CardDescription>
          </div>
          <Link href="/ghostwriter">
            <Button variant="outline" size="sm">
              Ghostwriter
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex items-end gap-3">
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="csv">Upload Beehiiv CSV</Label>
              <Input
                id="csv"
                name="csv"
                type="file"
                accept=".csv"
                disabled={pending}
              />
            </div>
            <Button type="submit" disabled={pending} className="gap-2">
              <Upload className="h-4 w-4" />
              {pending ? "Importing..." : "Import"}
            </Button>
          </form>

          {state.error && (
            <p className="text-sm text-destructive mt-3">{state.error}</p>
          )}
          {state.imported !== undefined && !state.error && (
            <p className="text-sm text-green-600 mt-3">
              Imported {state.imported.toLocaleString()} contacts —{" "}
              {state.workEmails?.toLocaleString()} work emails found
            </p>
          )}
        </CardContent>
      </Card>

      {stats && stats.total > 0 && (
        <>
          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-wide">Total</p>
                </div>
                <p className="text-2xl font-bold">
                  {stats.total.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Briefcase className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-wide">Work Emails</p>
                </div>
                <p className="text-2xl font-bold">
                  {stats.workEmails.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Mail className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-wide">Personal</p>
                </div>
                <p className="text-2xl font-bold">
                  {stats.personalEmails.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Globe className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-wide">Domains</p>
                </div>
                <p className="text-2xl font-bold">
                  {stats.topDomains.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {stats.topDomains.length > 0 && (
            <Card className="w-full max-w-4xl">
              <CardHeader>
                <CardTitle className="text-lg">Top Work Domains</CardTitle>
                <CardDescription>
                  Companies with the most subscribers in your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.topDomains.map((d) => (
                    <Badge
                      key={d.domain}
                      variant="outline"
                      className="text-sm py-1 px-3"
                    >
                      {d.domain}{" "}
                      <span className="ml-1 text-muted-foreground">
                        ({d.count})
                      </span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {contacts.length > 0 && (
            <Card className="w-full max-w-4xl">
              <CardHeader>
                <CardTitle className="text-lg">
                  Work Email Contacts
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({totalWork.toLocaleString()} total)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Email</th>
                        <th className="pb-2 pr-4">Domain</th>
                        <th className="pb-2 pr-4">Source</th>
                        <th className="pb-2">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((c) => (
                        <tr key={c.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-mono text-xs">
                            {c.email}
                          </td>
                          <td className="py-2 pr-4">
                            <Badge variant="outline" className="text-xs">
                              {c.emailDomain}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-xs text-muted-foreground truncate max-w-[200px]">
                            {c.source || "—"}
                          </td>
                          <td className="py-2 text-xs text-muted-foreground">
                            {c.subscribedOn
                              ? new Date(c.subscribedOn).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </main>
  )
}
