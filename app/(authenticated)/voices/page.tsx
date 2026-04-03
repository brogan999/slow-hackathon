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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createVoice, listVoices, deleteVoice } from "@/lib/actions/voices"
import { getQuality } from "@/lib/audience/quality"
import { useActionState } from "react"
import { useEffect, useState } from "react"
import { Trash2, Plus, Mic, FileText, Globe, Type, BookOpen, ChevronRight } from "lucide-react"
import Link from "next/link"

type Voice = {
  id: string
  name: string
  createdAt: Date
  wordCount: number
  sampleCount: number
  sourceType: string
}

const QUALITY_COLORS: Record<string, string> = {
  excellent: "bg-green-100 text-green-800 border-green-200",
  good: "bg-blue-100 text-blue-800 border-blue-200",
  fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
  poor: "bg-red-100 text-red-800 border-red-200",
}

const SOURCE_LABELS: Record<string, string> = {
  text: "Text",
  url: "URL",
  substack: "Substack",
  pdf: "PDF",
}

function DeleteButton({ voiceId }: { voiceId: string }) {
  const [, action, pending] = useActionState<{ error?: string }, FormData>(
    async (_prev, formData) => {
      const result = await deleteVoice(_prev, formData)
      return result ?? {}
    },
    {}
  )

  return (
    <form
      action={action}
      onClick={(e) => e.stopPropagation()}
    >
      <input type="hidden" name="voiceId" value={voiceId} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  )
}

export default function VoicesPage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [showForm, setShowForm] = useState(false)
  const [source, setSource] = useState("text")

  const [state, action, pending] = useActionState<
    { error?: string; success?: boolean; warning?: string },
    FormData
  >(
    async (_prev, formData) => {
      const result = await createVoice(_prev, formData)
      if (result?.success) {
        setShowForm(false)
        loadVoices()
      }
      return result ?? {}
    },
    {}
  )

  async function loadVoices() {
    const v = await listVoices()
    setVoices(v as Voice[])
  }

  useEffect(() => {
    loadVoices()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pt-12 gap-6">
      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Voices</CardTitle>
            <CardDescription>
              Add writing samples to create a voice profile for the ghostwriter.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/ghostwriter">
              <Button variant="outline" size="sm">
                Ghostwriter
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Voice
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t pt-6">
            <form action={action} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Voice Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder='e.g., "Paul Graham", "My Blog Voice"'
                  required
                  disabled={pending}
                />
              </div>

              <input type="hidden" name="source" value={source} />

              <Tabs
                value={source}
                onValueChange={setSource}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="text" className="gap-2">
                    <Type className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="url" className="gap-2">
                    <Globe className="h-4 w-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="substack" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Substack
                  </TabsTrigger>
                  <TabsTrigger value="pdf" className="gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="samples">Writing Samples</Label>
                    <Textarea
                      id="samples"
                      name="samples"
                      placeholder="Paste writing samples here. The more text you provide, the better the voice fingerprint will be..."
                      rows={10}
                      disabled={pending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 500 words. Paste multiple essays or blog posts for best results.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="url" className="mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="urls">URLs (one per line)</Label>
                    <Textarea
                      id="urls"
                      name="urls"
                      placeholder={"https://example.com/blog/post-1\nhttps://example.com/blog/post-2\nhttps://example.com/blog/post-3"}
                      rows={6}
                      disabled={pending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter blog post or article URLs. More URLs = better voice.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="substack" className="mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="substackUrl">Substack URL</Label>
                    <Input
                      id="substackUrl"
                      name="substackUrl"
                      placeholder="https://newsletter.example.com or example.substack.com"
                      disabled={pending}
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll scrape up to 50 posts from the archive automatically.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="pdf" className="mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pdf">Upload PDF</Label>
                    <Input
                      id="pdf"
                      name="pdf"
                      type="file"
                      accept=".pdf"
                      disabled={pending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload a PDF containing writing samples.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
              {state.warning && !state.error && (
                <p className="text-sm text-yellow-600">{state.warning}</p>
              )}

              <Button type="submit" disabled={pending}>
                {pending ? "Analyzing voice..." : "Create Voice"}
              </Button>

              {pending && (
                <p className="text-sm text-muted-foreground animate-pulse text-center">
                  {source === "substack"
                    ? "Scraping Substack archive and extracting voice fingerprint. This may take 2-3 minutes."
                    : source === "url"
                      ? "Scraping URLs and extracting voice fingerprint..."
                      : source === "pdf"
                        ? "Extracting text from PDF and analyzing voice..."
                        : "Analyzing writing samples..."}
                </p>
              )}
            </form>
          </CardContent>
        )}

        <CardContent className={showForm ? "border-t pt-6" : ""}>
          {voices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mic className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No voices yet. Create one to get started.</p>
              <p className="text-xs mt-1">
                The built-in Packy McCormick voice is always available on the ghostwriter page.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {voices.map((voice) => {
                const quality = getQuality(voice.wordCount, voice.sampleCount)
                return (
                  <Link key={voice.id} href={`/voices/${voice.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{voice.name}</p>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${QUALITY_COLORS[quality]}`}
                            >
                              {quality}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{voice.wordCount.toLocaleString()} words</span>
                            <span>{voice.sampleCount} {voice.sampleCount === 1 ? "sample" : "samples"}</span>
                            <span>{SOURCE_LABELS[voice.sourceType] || voice.sourceType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DeleteButton voiceId={voice.id} />
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
