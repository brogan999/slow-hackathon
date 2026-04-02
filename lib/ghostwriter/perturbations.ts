export const AI_TELLTALE_WORDS: Record<string, string[]> = {
  "crucial": ["important", "key", "big"],
  "comprehensive": ["full", "thorough"],
  "facilitate": ["help", "enable"],
  "leverage": ["use"],
  "robust": ["strong", "solid"],
  "utilize": ["use"],
  "implement": ["build", "set up"],
  "significant": ["big", "major"],
  "demonstrate": ["show", "prove"],
  "fundamental": ["basic", "core"],
  "paradigm": ["model", "framework"],
  "landscape": ["world", "scene"],
  "ecosystem": ["world", "system"],
  "streamline": ["simplify"],
  "innovative": ["new", "novel"],
  "transformative": ["game-changing"],
  "underscore": ["highlight", "show"],
  "nuanced": ["subtle", "complex"],
  "multifaceted": ["complex"],
  "delve": ["dig into", "explore"],
  "realm": ["area", "world"],
  "moreover": ["also", "and", "plus"],
  "furthermore": ["also", "on top of that"],
  "consequently": ["so", "as a result"],
  "nevertheless": ["but", "still"],
  "notwithstanding": ["despite"],
  "aforementioned": ["the", "that"],
  "pertaining to": ["about", "related to"],
  "in terms of": ["for", "regarding"],
  "it is worth noting": ["note that"],
  "it is important to": ["we should", "you need to"],
  "tapestry": ["mix", "web"],
  "pivotal": ["key", "big"],
  "myriad": ["tons of", "a bunch of"],
  "paramount": ["top", "key"],
  "embark": ["start", "kick off"],
  "navigating": ["figuring out", "working through"],
  "navigate": ["figure out", "work through"],
  "overarching": ["big-picture", "main"],
  "testament": ["proof", "sign"],
  "beacon": ["signal", "example"],
  "bustling": ["busy", "active"],
  "intricate": ["complex", "detailed"],
  "commendable": ["solid", "good"],
  "endeavor": ["effort", "project"],
  "fostering": ["building", "growing"],
  "foster": ["build", "grow"],
  "realms": ["areas", "spaces"],
  "spearhead": ["lead", "drive"],
  "underpin": ["support", "back"],
  "underpins": ["supports", "backs"],
  "bolster": ["boost", "strengthen"],
  "encompass": ["cover", "include"],
  "encompasses": ["covers", "includes"],
  "elucidate": ["explain", "spell out"],
  "juxtapose": ["compare", "contrast"],
  "holistic": ["full", "complete"],
  "synergy": ["combo", "teamwork"],
  "catalyze": ["spark", "trigger"],
  "catalyzing": ["sparking", "triggering"],
  "underscored": ["showed", "highlighted"],
}

export const AI_SENTENCE_STARTERS = [
  "Additionally,",
  "Moreover,",
  "Furthermore,",
  "It's worth noting that",
  "It is worth noting that",
  "It is important to note that",
  "In essence,",
  "Ultimately,",
  "Fundamentally,",
  "Interestingly,",
  "Notably,",
  "Importantly,",
  "In conclusion,",
  "To summarize,",
  "It bears mentioning",
  "It should be noted",
  "One could argue",
  "It goes without saying",
  "Needless to say,",
  "As previously mentioned,",
  "In light of this,",
  "With that being said,",
  "That being said,",
  "Having said that,",
  "It remains to be seen",
  "At the end of the day,",
]

export const HUMAN_SENTENCE_STARTERS = [
  "And",
  "But",
  "So",
  "Look,",
  "Here's the thing:",
  "OK so",
  "The weird part is",
  "Which means",
  "Thing is,",
  "Right,",
  "Also:",
  "Plus",
  "Honestly,",
  "I mean,",
  "The funny thing is",
  "Wait —",
  "Here's what's wild:",
]

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function perturbTokens(text: string, intensity = 0.8): string {
  let result = text

  for (const [aiWord, replacements] of Object.entries(AI_TELLTALE_WORDS)) {
    if (Math.random() > intensity) continue

    const replacement = randomChoice(replacements)
    const pattern = new RegExp("\\b" + escapeRegex(aiWord) + "\\b", "gi")

    result = result.replace(pattern, (match) => {
      if (!replacement) return ""
      if (match[0] === match[0].toUpperCase()) {
        return replacement[0].toUpperCase() + replacement.slice(1)
      }
      return replacement
    })
  }

  const lines = result.split("\n")
  const updated: string[] = []

  for (const line of lines) {
    const trimmed = line.trimStart()
    const indent = line.slice(0, line.length - trimmed.length)
    let replaced = false

    for (const starter of AI_SENTENCE_STARTERS) {
      if (trimmed.startsWith(starter) && Math.random() < intensity) {
        const human = randomChoice(HUMAN_SENTENCE_STARTERS)
        const rest = trimmed.slice(starter.length).replace(/^[,\s]+/, "")
        updated.push(`${indent}${human} ${rest}`)
        replaced = true
        break
      }
    }

    if (!replaced) {
      updated.push(line)
    }
  }

  return updated.join("\n")
}
