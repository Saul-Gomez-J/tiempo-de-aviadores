import { createHighlighter, type Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript', 'typescript', 'python', 'shellscript', 'plaintext'],
    })
  }
  return highlighterPromise
}

const CODE_LANGUAGE_MAP: Record<string, string> = {
  bash: 'shellscript',
  sh: 'shellscript',
  zsh: 'shellscript',
  shell: 'shellscript',
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  plain: 'plaintext',
  'plain-text': 'plaintext',
  text: 'plaintext',
  txt: 'plaintext',
  py: 'python',
}

export function resolveLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim()
  return CODE_LANGUAGE_MAP[normalized] || normalized || 'plaintext'
}
