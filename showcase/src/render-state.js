import { formatHtml } from './format-html.js'

export function isCurrentRender(revision, currentRevision) {
  return Number.isInteger(revision) && revision === currentRevision
}

// HTML affiché et copié : reformaté pour la lecture, sans changer le rendu.
export function normalizeRenderedHtml(html) {
  return typeof html === 'string' ? formatHtml(html) : ''
}
