import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/* Skills are markdown files with a small frontmatter block: name, description, tools. */

let cache = null

export function loadSkills() {
  if (cache) return cache
  const dir = join(process.cwd(), 'skills')
  const skills = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parse(readFileSync(join(dir, f), 'utf8')))
    .filter((s) => s.name)
  // In dev, re-read every request so skill edits apply without a server restart.
  if (process.env.NODE_ENV === 'production') cache = skills
  return skills
}

function parse(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) return {}
  const meta = Object.fromEntries(
    m[1].split('\n').map((line) => {
      const i = line.indexOf(':')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
    }),
  )
  return {
    name: meta.name,
    description: meta.description,
    tools: (meta.tools || '').split(',').map((s) => s.trim()).filter(Boolean),
    body: m[2].trim(),
  }
}
