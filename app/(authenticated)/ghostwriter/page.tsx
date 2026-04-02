"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { generateGhostwriterEssay } from "@/lib/actions/ghostwriter"
import { useActionState } from "react"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

export default function GhostwriterPage() {
  const [state, action, pending] = useActionState<
    { text?: string; error?: string },
    FormData
  >(
    async (_prev, formData) => {
      const result = await generateGhostwriterEssay(_prev, formData)
      return result ?? {}
    },
    {}
  )

  const [copied, setCopied] = useState(false)

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
          <CardTitle className="text-2xl">Ghostwriter</CardTitle>
          <CardDescription>
            Enter a topic and get an AI-detection-proof essay in the author's
            voice.
          </CardDescription>
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
                This may take up to a minute. The AI is writing, then
                post-processing runs to remove detection patterns.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

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
