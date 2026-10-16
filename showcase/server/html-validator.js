const DEFAULT_W3C_VALIDATOR_URL = 'https://validator.w3.org/nu/'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

export function createValidationDocument(html, title = 'Open UI component') {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
</head>
<body>
${html}
</body>
</html>`
}

export function normalizeW3cMessages(payload = {}) {
  const messages = Array.isArray(payload.messages) ? payload.messages : []

  return messages.map((message) => ({
    type: message.type === 'error'
      ? 'error'
      : message.subType === 'warning'
        ? 'warning'
        : 'info',
    message: String(message.message ?? 'Message du validateur sans description.'),
    extract: typeof message.extract === 'string' ? message.extract : '',
    firstLine: toOptionalNumber(message.firstLine),
    lastLine: toOptionalNumber(message.lastLine),
    firstColumn: toOptionalNumber(message.firstColumn),
    lastColumn: toOptionalNumber(message.lastColumn)
  }))
}

export async function validateHtmlWithW3c(html, options = {}) {
  const endpoint = resolveValidatorUrl(options.endpoint)
  const document = options.fullDocument
    ? String(html)
    : createValidationDocument(html, options.title)
  const fetchImplementation = options.fetchImplementation ?? fetch
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeout ?? 12_000)

  try {
    const response = await fetchImplementation(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'text/html; charset=utf-8',
        'User-Agent': 'Open-UI/2.0'
      },
      body: document,
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Le validateur HTML a répondu avec le statut ${response.status}.`)
    }

    const messages = normalizeW3cMessages(await response.json())
    return {
      validator: 'Nu HTML Checker',
      external: !LOCAL_HOSTS.has(endpoint.hostname),
      endpoint: endpoint.origin,
      errors: messages.filter((message) => message.type === 'error').length,
      warnings: messages.filter((message) => message.type === 'warning').length,
      messages
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Le validateur HTML n’a pas répondu dans le délai prévu.')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function resolveValidatorUrl(value) {
  const endpoint = new URL(value || DEFAULT_W3C_VALIDATOR_URL)
  if (!['http:', 'https:'].includes(endpoint.protocol)) {
    throw new Error('OPENUI_W3C_VALIDATOR_URL doit utiliser HTTP ou HTTPS.')
  }
  endpoint.searchParams.set('out', 'json')
  return endpoint
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function toOptionalNumber(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
