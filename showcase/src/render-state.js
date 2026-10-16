export function isCurrentRender(revision, currentRevision) {
  return Number.isInteger(revision) && revision === currentRevision
}

export function normalizeRenderedHtml(html) {
  return typeof html === 'string' ? html.trim() : ''
}
