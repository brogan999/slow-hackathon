import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, PenTool, FileText, Globe, Type, BookOpen } from "lucide-react"
import Link from "next/link"
import { getQuality } from "@/lib/audience/quality"

const QUALITY_COLORS: Record<string, string> = {
  excellent: "bg-green-100 text-green-800 border-green-200",
  good: "bg-blue-100 text-blue-800 border-blue-200",
  fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
  poor: "bg-red-100 text-red-800 border-red-200",
}

const QUALITY_DESCRIPTIONS: Record<string, string> = {
  excellent: "Excellent corpus — strong voice fingerprint with diverse samples.",
  good: "Good corpus — reliable voice fingerprint for most topics.",
  fair: "Fair corpus — voice will work but adding more samples will improve quality.",
  poor: "Weak corpus — consider adding more writing samples for better results.",
}

const SOURCE_ICONS: Record<string, typeof Type> = {
  text: Type,
  url: Globe,
  substack: BookOpen,
  pdf: FileText,
}

const SOURCE_LABELS: Record<string, string> = {
  text: "Pasted text",
  url: "Scraped from URLs",
  substack: "Scraped from Substack",
  pdf: "Extracted from PDF",
}

export default async function VoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const voice = await prisma.voice.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!voice) redirect("/voices")

  const quality = getQuality(voice.wordCount, voice.sampleCount)
  const SourceIcon = SOURCE_ICONS[voice.sourceType] || Type

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pt-12 gap-6">
      <div className="w-full max-w-3xl">
        <Link href="/voices" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Voices
        </Link>
      </div>

      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl">{voice.name}</CardTitle>
              <Badge
                variant="outline"
                className={`text-xs capitalize ${QUALITY_COLORS[quality]}`}
              >
                {quality}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {new Date(voice.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Link href={`/ghostwriter?voiceId=${voice.id}`}>
            <Button className="gap-2">
              <PenTool className="h-4 w-4" />
              Use in Ghostwriter
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{QUALITY_DESCRIPTIONS[quality]}</p>
        </CardContent>
      </Card>

      <div className="w-full max-w-3xl grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{voice.wordCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Words</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{voice.sampleCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {voice.sampleCount === 1 ? "Sample" : "Samples"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <SourceIcon className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {SOURCE_LABELS[voice.sourceType] || voice.sourceType}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Voice Fingerprint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed max-h-[500px] overflow-y-auto">
            {voice.fingerprint}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">
            Sample Preview
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (first 3,000 characters)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground max-h-[400px] overflow-y-auto font-mono text-xs">
            {voice.samples.slice(0, 3000)}
            {voice.samples.length > 3000 && "..."}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
