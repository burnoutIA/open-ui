import 'virtual:openui-project-styles'
// Scripts des composants : délégation d'événements sur document, ils s'appliquent aussi au HTML monté plus tard.
import 'virtual:openui-project-scripts'
import { SHOWCASE_API, SHOWCASE_MESSAGES, SHOWCASE_PREVIEW_SOURCE, SHOWCASE_SOURCE } from '../shared/protocol.js'
import { normalizeAxeResults } from './quality-state.js'

const root = document.querySelector('#preview-root')
const pageFrame = document.querySelector('#page-preview')
const placeholder = document.querySelector('#preview-placeholder')
const errorPanel = document.querySelector('#preview-error')
let activeRequest = null
let activeRevision = 0
let axeModulePromise = null
let pageResizeObserver = null

window.addEventListener('message', handleMessage)
document.addEventListener('submit', (event) => event.preventDefault())
document.addEventListener('click', (event) => {
  const link = event.target instanceof Element
    ? event.target.closest('a[href]')
    : null
  if (link) event.preventDefault()
})

const resizeObserver = new ResizeObserver(reportHeight)
resizeObserver.observe(root)

postToShowcase(SHOWCASE_MESSAGES.ready)

async function handleMessage(event) {
  if (event.source !== window.parent) return
  if (event.origin !== location.origin) return
  if (event.data?.source !== SHOWCASE_SOURCE) return

  if (event.data.type === SHOWCASE_MESSAGES.connect) {
    postToShowcase(SHOWCASE_MESSAGES.ready)
    return
  }

  if (event.data.type === SHOWCASE_MESSAGES.settings) {
    document.body.dataset.background = event.data.background ?? 'light'
    return
  }

  if (event.data.type === SHOWCASE_MESSAGES.audit) {
    runAccessibilityAudit(event.data.revision)
    return
  }

  if (event.data.type !== SHOWCASE_MESSAGES.render) return

  const revision = event.data.revision
  activeRevision = revision
  activeRequest?.abort()
  activeRequest = new AbortController()
  root.setAttribute('aria-busy', 'true')
  errorPanel.hidden = true

  try {
    const response = await fetch(SHOWCASE_API.render, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entryType: event.data.entryType,
        entryId: event.data.entryId,
        props: event.data.props
      }),
      signal: activeRequest.signal
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error ?? 'Le rendu Twig a échoué.')

    const mounted = payload.entry.type === 'page'
      ? await mountPage(payload.html, payload.entry, revision)
      : mountComponent(payload.html, payload.entry)
    if (!mounted || revision !== activeRevision) return

    root.setAttribute('aria-busy', 'false')
    placeholder.hidden = true
    errorPanel.hidden = true
    postToShowcase(SHOWCASE_MESSAGES.rendered, {
      entryKey: payload.entry.key,
      entryType: payload.entry.type,
      html: payload.html,
      revision
    })
    requestAnimationFrame(reportHeight)
  } catch (error) {
    if (error.name === 'AbortError') return
    pageResizeObserver?.disconnect()
    pageResizeObserver = null
    pageFrame.hidden = true
    pageFrame.srcdoc = ''
    root.replaceChildren()
    root.setAttribute('aria-busy', 'false')
    placeholder.hidden = true
    errorPanel.hidden = false
    errorPanel.textContent = error.message
    postToShowcase(SHOWCASE_MESSAGES.error, { error: error.message, revision })
    reportHeight()
  }
}

async function runAccessibilityAudit(revision) {
  try {
    axeModulePromise ??= import('axe-core').then((module) => module.default)
    const axe = await axeModulePromise
    const isPage = document.body.dataset.entryType === 'page'
    const auditTarget = isPage ? pageFrame.contentDocument : root
    if (!auditTarget) throw new Error('Le document de prévisualisation est indisponible.')
    // Une page vit dans sa propre iframe : axe doit tourner dans ce document, pas depuis l'aperçu
    // (un document d'un autre contexte JS est refusé par axe.run).
    const runner = isPage ? injectAxe(pageFrame, axe.source) : axe
    const results = await runner.run(auditTarget, {
      resultTypes: ['violations', 'incomplete', 'passes']
    })

    postToShowcase(SHOWCASE_MESSAGES.audited, {
      revision,
      violations: normalizeAxeResults(results.violations),
      incomplete: normalizeAxeResults(results.incomplete),
      passes: results.passes.length
    })
  } catch (error) {
    postToShowcase(SHOWCASE_MESSAGES.auditError, {
      revision,
      error: error.message
    })
  }
}

function injectAxe(frame, source) {
  const frameWindow = frame.contentWindow
  if (!frameWindow.axe) {
    const script = frame.contentDocument.createElement('script')
    script.textContent = source
    frame.contentDocument.head.append(script)
  }
  return frameWindow.axe
}

function reportHeight() {
  if (document.body.dataset.entryType === 'page') {
    const pageHeight = syncPageHeight()
    postToShowcase(SHOWCASE_MESSAGES.resize, { height: pageHeight })
    return
  }

  const rootHeight = Math.ceil(root.getBoundingClientRect().height)
  postToShowcase(SHOWCASE_MESSAGES.resize, { height: rootHeight + 96 })
}

function mountComponent(html, entry) {
  pageResizeObserver?.disconnect()
  pageResizeObserver = null
  document.body.dataset.entryType = 'component'
  pageFrame.hidden = true
  pageFrame.srcdoc = ''
  root.hidden = false
  root.innerHTML = html
  root.dataset.level = entry.level
  return true
}

function mountPage(html, entry, revision) {
  pageResizeObserver?.disconnect()
  pageResizeObserver = null
  document.body.dataset.entryType = 'page'
  root.hidden = true
  root.replaceChildren()
  pageFrame.hidden = false
  pageFrame.title = `Prévisualisation de la page ${entry.name}`

  return new Promise((resolve) => {
    pageFrame.addEventListener('load', () => {
      if (revision !== activeRevision) {
        resolve(false)
        return
      }

      const pageDocument = pageFrame.contentDocument
      if (!pageDocument) {
        resolve(false)
        return
      }

      pageDocument.addEventListener('submit', (event) => event.preventDefault(), true)
      pageDocument.addEventListener('click', preventPageNavigation, true)
      pageResizeObserver = new ResizeObserver(reportHeight)
      pageResizeObserver.observe(pageDocument.documentElement)
      syncPageHeight()
      resolve(true)
    }, { once: true })

    pageFrame.srcdoc = preparePagePreviewHtml(html, entry.id)
  })
}

function preparePagePreviewHtml(html, entryId) {
  if (/<base\b/i.test(html)) return html
  const base = `<base href="/${encodeURIComponent(entryId)}.html">`
  return /<head(?:\s[^>]*)?>/i.test(html)
    ? html.replace(/<head(\s[^>]*)?>/i, (head) => `${head}${base}`)
    : `${base}${html}`
}

function preventPageNavigation(event) {
  const link = typeof event.target?.closest === 'function'
    ? event.target.closest('a[href]')
    : null
  if (link) event.preventDefault()
}

function syncPageHeight() {
  // Pleine hauteur du contenu : seule la zone d'aperçu du Showcase défile, jamais l'iframe de la page.
  // Pendant le remplacement du srcdoc, le document de l'iframe est vide (documentElement null) :
  // garder la hauteur actuelle, le prochain redimensionnement la mettra à jour.
  const pageRoot = pageFrame.contentDocument?.documentElement
  if (!pageRoot) return Number.parseInt(pageFrame.style.height, 10) || 720
  const contentHeight = pageRoot.scrollHeight
  const pageHeight = Math.max(720, Math.ceil(contentHeight))
  pageFrame.style.height = `${pageHeight}px`
  return pageHeight
}

function postToShowcase(type, payload = {}) {
  window.parent.postMessage({
    source: SHOWCASE_PREVIEW_SOURCE,
    type,
    ...payload
  }, location.origin)
}
