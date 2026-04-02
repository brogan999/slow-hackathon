"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateGhostwriterEssay } from "@/lib/actions/ghostwriter"
import { listVoices } from "@/lib/actions/voices"
import { useActionState } from "react"
import { Copy, Check, ShieldCheck, ShieldAlert } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import type { PangramScore } from "@/lib/ghostwriter/pangram"
import type { PipelineMode } from "@/lib/ghostwriter/generate"

const MODE_LABELS: Record<PipelineMode, { label: string; description: string }> = {
  basic: {
    label: "Basic",
    description: "Gemini + anti-detection prompt (no corpus)",
  },
  corpus: {
    label: "Corpus-grounded",
    description: "Gemini + exemplar paragraphs + writing samples",
  },
  opus: {
    label: "Corpus + Opus rewrite",
    description: "Corpus-grounded + Claude Opus 4.6 post-processing",
  },
}

type Voice = { id: string; name: string }

export default function GhostwriterPage() {
  const [state, action, pending] = useActionState<
    { text?: string; error?: string; score?: PangramScore; mode?: PipelineMode },
    FormData
  >(
    async (_prev, formData) => {
      const result = await generateGhostwriterEssay(_prev, formData)
      return result ?? {}
    },
    {}
  )

  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<PipelineMode>("opus")
  const [voiceId, setVoiceId] = useState("default")
  const [voices, setVoices] = useState<Voice[]>([])

  useEffect(() => {
    listVoices().then((v) => setVoices(v as Voice[]))
  }, [])

  async function handleCopy() {
    if (!state.text) return
    await navigator.clipboard.writeText(state.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pt-12 gap-6">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Ghostwriter</CardTitle>
              <CardDescription>
                Enter a topic and get an AI-detection-proof essay in the
                selected voice.
              </CardDescription>
            </div>
            <Link href="/voices">
              <Button variant="outline" size="sm">
                Manage Voices
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Textarea
                id="topic"
                name="topic"
                placeholder="What should I write about? Be specific — include angles, threads to follow, and your take..."
                rows={5}
                required
                disabled={pending}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="flex flex-col gap-2 min-w-0">
                <Label>Voice</Label>
                <Select
                  value={voiceId}
                  onValueChange={setVoiceId}
                  disabled={pending}
                >
                  <SelectTrigger className="w-full truncate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      Packy McCormick (built-in)
                    </SelectItem>
                    {voices.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="voiceId"
                  value={voiceId === "default" ? "" : voiceId}
                />
              </div>

              <div className="flex flex-col gap-2 min-w-0">
                <Label>Pipeline</Label>
                <Select
                  value={mode}
                  onValueChange={(v) => setMode(v as PipelineMode)}
                  disabled={pending}
                >
                  <SelectTrigger className="w-full truncate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(MODE_LABELS) as [
                        PipelineMode,
                        { label: string; description: string },
                      ][]
                    ).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="mode" value={mode} />
              </div>
            </div>

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={pending}
            >
              {pending ? "Generating..." : "Generate Essay"}
            </Button>

            {pending && (
              <p className="text-sm text-muted-foreground animate-pulse text-center">
                {mode === "opus"
                  ? "This may take 2-3 minutes. Gemini writes, then Claude Opus rewrites to disrupt stenographic patterns."
                  : "This may take up to a minute. The AI is writing, then post-processing runs."}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {state.score && (
        <Card className="w-full max-w-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              {state.score.passing ? (
                <ShieldCheck className="h-6 w-6 text-green-500" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-red-500" />
              )}
              <CardTitle className="text-lg">Pangram AI Detection</CardTitle>
              {state.mode && (
                <Badge variant="outline" className="text-xs">
                  {MODE_LABELS[state.mode].label}
                </Badge>
              )}
            </div>
            <Badge variant={state.score.passing ? "default" : "destructive"}>
              {state.score.passing ? "PASS" : "FAIL"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Verdict
                </p>
                <p className="text-sm font-medium mt-1">
                  {state.score.headline}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  AI Fraction
                </p>
                <p className="text-sm font-medium mt-1">
                  {(state.score.fractionAi * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Max Window Score
                </p>
                <p className="text-sm font-medium mt-1">
                  {(state.score.maxScore * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Flagged Windows
                </p>
                <p className="text-sm font-medium mt-1">
                  {state.score.numFlagged} / {state.score.numTotal}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {state.text && (
        <Card className="w-full max-w-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Output</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm leading-relaxed font-serif">
              {state.text}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
