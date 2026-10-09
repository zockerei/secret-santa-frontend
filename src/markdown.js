import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Wish lists are markdown. The HTML is sanitized, because other people's wish lists are shown too.
export function renderMarkdown(text) {
  if (!text) return ''
  return DOMPurify.sanitize(marked.parse(text, { breaks: true, gfm: true }))
}
