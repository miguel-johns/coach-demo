import { Fragment } from 'react'

/* A small renderer for Milton's replies: paragraphs, "- " lists, **bold**, and person:/screen: links. */

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g

function go(href) {
  const M = window.M
  if (!M) return
  if (href.startsWith('person:')) return M.acts.record(href.slice(7))
  if (href.startsWith('screen:')) {
    const [page, tab] = href.slice(7).split('/')
    if (M.pages[page]) M.go({ page, tab })
  }
}

function Inline({ text }) {
  return text.split(INLINE).map((piece, i) => {
    if (piece.startsWith('**') && piece.endsWith('**'))
      return (
        <b key={i}>
          <Inline text={piece.slice(2, -2)} />
        </b>
      )
    const link = piece.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const [, label, href] = link
      if (/^(person|screen):/.test(href))
        return (
          <button key={i} type="button" className="mlink" onClick={() => go(href)}>
            {label}
          </button>
        )
      return <Fragment key={i}>{label}</Fragment>
    }
    return <Fragment key={i}>{piece}</Fragment>
  })
}

const BULLET = /^\s*[-*] /

/* Group lines into runs of list items and runs of plain text, so a heading line can sit right above a list. */
function toBlocks(text) {
  const blocks = []
  text
    .trim()
    .split('\n')
    .forEach((line) => {
      if (!line.trim()) return blocks.push(null)
      const kind = BULLET.test(line) ? 'ul' : 'p'
      const last = blocks[blocks.length - 1]
      if (last && last.kind === kind) last.lines.push(line)
      else blocks.push({ kind, lines: [line] })
    })
  return blocks.filter(Boolean)
}

export default function Markdown({ text }) {
  return toBlocks(text).map((block, i) =>
    block.kind === 'ul' ? (
      <ul key={i}>
        {block.lines.map((l, j) => (
          <li key={j}>
            <Inline text={l.replace(BULLET, '')} />
          </li>
        ))}
      </ul>
    ) : (
      <p key={i}>
        {block.lines.map((l, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            <Inline text={l.replace(/^#+\s*/, '')} />
          </Fragment>
        ))}
      </p>
    ),
  )
}
