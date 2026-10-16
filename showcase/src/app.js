import { SHOWCASE_API, SHOWCASE_MESSAGES, SHOWCASE_PREVIEW_SOURCE, SHOWCASE_SOURCE } from '../shared/protocol.js'
import { getComponentDefaults, renderComposition, renderControls } from './controls.js'
import { summarizeQualityReport } from './quality-state.js'
import { isCurrentRender, normalizeRenderedHtml } from './render-state.js'

const LEVEL_ORDER = ['page', 'atom', 'molecule', 'organism', 'template']
const LEVEL_LABELS = {
  page: 'Pages',
  atom: 'Atoms',
  molecule: 'Molécules',
  organism: 'Organismes',
  template: 'Templates'
}

const elements = {
  catalogStatus: document.querySelector('#catalog-status'),
  catalogCount: document.querySelector('#catalog-count'),
  componentList: document.querySelector('#component-list'),
  search: document.querySelector('#component-search'),
  componentMeta: document.querySelector('#component-meta'),
  componentTitle: document.querySelector('#component-title'),
  componentDescription: document.querySelector('#component-description'),
  reset: document.querySelector('#reset-controls'),
  empty: document.querySelector('#inspector-empty'),
  controls: document.querySelector('#controls-container'),
  composition: document.querySelector('#composition-container'),
  propsOutput: document.querySelector('#props-output'),
  previewFrame: document.querySelector('#preview-frame'),
  previewShell: document.querySelector('#preview-shell'),
  workspaceEmpty: document.querySelector('#workspace-empty'),
  workspaceEmptyTitle: document.querySelector('#workspace-empty-title'),
  workspaceEmptyDescription: document.querySelector('#workspace-empty-description'),
  viewportPicker: document.querySelector('.viewport-picker'),
  renderStatus: document.querySelector('#render-status'),
  htmlStatus: document.querySelector('#html-output-status'),
  htmlPre: document.querySelector('#html-output-pre'),
  htmlCode: document.querySelector('#html-output-code'),
  copyHtml: document.querySelector('#copy-html'),
  copyHtmlStatus: document.querySelector('#copy-html-status'),
  qualityButton: document.querySelector('#run-quality'),
  qualityOutput: document.querySelector('#quality-output'),
  qualityPanel: document.querySelector('#quality-panel'),
  qualityStatus: document.querySelector('#quality-status'),
  qualityLive: document.querySelector('#quality-live'),
  w3cBadge: document.querySelector('#w3c-badge'),
  w3cSummary: document.querySelector('#w3c-summary'),
  w3cResults: document.querySelector('#w3c-results'),
  axeBadge: document.querySelector('#axe-badge'),
  axeSummary: document.querySelector('#axe-summary'),
  axeResults: document.querySelector('#axe-results'),
  background: document.querySelector('#preview-background')
}

const state = {
  entries: [],
  selected: null,
  props: {},
  previewReady: false,
  renderTimer: null,
  renderRevision: 0,
  renderedHtml: '',
  qualityRunId: 0,
  qualityTimer: null,
  activeQualityRun: null,
  qualityReports: new Map()
}

elements.search.addEventListener('input', () => renderCatalog(elements.search.value))
elements.reset.addEventListener('click', resetSelectedEntry)
elements.background.addEventListener('change', sendPreviewSettings)
elements.previewFrame.addEventListener('load', connectPreview)
elements.copyHtml.addEventListener('click', copyRenderedHtml)
elements.qualityButton.addEventListener('click', runQualityChecks)

for (const input of document.querySelectorAll('input[name="viewport"]')) {
  input.addEventListener('change', updateViewport)
}

window.addEventListener('message', handlePreviewMessage)
window.addEventListener('hashchange', selectFromHash)

connectPreview()
loadCatalog()

async function loadCatalog() {
  elements.catalogStatus.textContent = 'Chargement du catalogue…'

  try {
    const response = await fetch(SHOWCASE_API.catalog, { headers: { Accept: 'application/json' } })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error ?? 'Catalogue indisponible.')

    state.entries = payload.entries ?? []
    elements.catalogCount.textContent = String(state.entries.length)
    const componentsCount = payload.counts?.components ?? state.entries.filter((entry) => entry.type === 'component').length
    const pagesCount = payload.counts?.pages ?? state.entries.filter((entry) => entry.type === 'page').length
    elements.catalogStatus.textContent = `${componentsCount} composant${componentsCount > 1 ? 's' : ''} · ${pagesCount} page${pagesCount > 1 ? 's' : ''}`
    renderCatalog('')

    if (!state.entries.length) {
      showEmptyWorkspace()
      return
    }

    enableEntryWorkspace()
    selectFromHash()
  } catch (error) {
    elements.catalogStatus.textContent = 'Showcase indisponible'
    elements.componentList.replaceChildren(createMessage(error.message, 'catalog__empty'))
    elements.renderStatus.textContent = 'Lancez le Showcase avec npm run dev.'
    showWorkspaceError(error.message)
  }
}

function renderCatalog(query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('fr')
  const filtered = state.entries.filter((entry) => {
    const haystack = [entry.name, entry.id, entry.type, entry.category, entry.description]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('fr')
    return haystack.includes(normalizedQuery)
  })

  elements.componentList.replaceChildren()

  if (!filtered.length) {
    const message = state.entries.length
      ? 'Aucun composant ou page ne correspond à cette recherche.'
      : 'Aucun composant dans dev/components ni page dans dev/pages pour le moment.'
    elements.componentList.append(createMessage(message, 'catalog__empty'))
    return
  }

  const grouped = new Map()
  for (const level of LEVEL_ORDER) grouped.set(level, [])
  for (const entry of filtered) {
    if (!grouped.has(entry.level)) grouped.set(entry.level, [])
    grouped.get(entry.level).push(entry)
  }

  for (const [level, entries] of grouped) {
    if (!entries.length) continue

    const section = document.createElement('section')
    section.className = 'catalog-group'
    const title = document.createElement('h3')
    title.textContent = LEVEL_LABELS[level] ?? level
    const list = document.createElement('ul')

    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'fr'))) {
      const item = document.createElement('li')
      const button = document.createElement('button')
      button.className = 'component-button'
      button.type = 'button'
      button.dataset.entryKey = entry.key
      button.setAttribute('aria-pressed', entry.key === state.selected?.key ? 'true' : 'false')
      button.addEventListener('click', () => selectEntry(entry.key))

      const name = document.createElement('span')
      name.className = 'component-button__name'
      name.textContent = entry.name
      const category = document.createElement('span')
      category.className = 'component-button__category'
      category.textContent = entry.type === 'page' ? 'Page complète' : entry.category
      const qualitySummary = summarizeQualityReport(state.qualityReports.get(entry.key))
      const quality = document.createElement('span')
      quality.className = 'component-button__quality'
      quality.dataset.status = qualitySummary.status
      quality.textContent = qualitySummary.catalogLabel
      quality.title = `Dernier contrôle automatique : ${qualitySummary.label}`
      quality.setAttribute('aria-hidden', 'true')
      const qualityLabel = document.createElement('span')
      qualityLabel.className = 'visually-hidden'
      qualityLabel.textContent = `Dernier contrôle automatique : ${qualitySummary.label}.`
      button.append(name, category, quality, qualityLabel)
      item.append(button)
      list.append(item)
    }

    section.append(title, list)
    elements.componentList.append(section)
  }
}

function selectFromHash() {
  if (!state.entries.length) return
  const requested = decodeURIComponent(location.hash.replace(/^#/, ''))
  const entry = state.entries.find((candidate) => candidate.key === requested)
    ?? state.entries.find((candidate) => candidate.type === 'component' && candidate.id === requested)
    ?? state.entries[0]
  if (entry.key !== state.selected?.key) selectEntry(entry.key, false)
}

function selectEntry(entryKey, updateHash = true) {
  const entry = state.entries.find((candidate) => candidate.key === entryKey)
  if (!entry) return

  state.selected = entry
  state.props = getComponentDefaults(entry)
  enableEntryWorkspace()

  if (updateHash) history.replaceState(null, '', `#${encodeURIComponent(entry.key)}`)

  elements.componentMeta.textContent = `${entry.type === 'page' ? 'page' : entry.level} · ${entry.category} · ${entry.id}`
  elements.componentTitle.textContent = entry.name
  elements.componentDescription.textContent = entry.description
  elements.previewFrame.title = `Prévisualisation de ${entry.type === 'page' ? 'la page' : 'du composant'} ${entry.name}`
  elements.empty.hidden = true
  elements.reset.disabled = false

  renderControls(elements.controls, entry, state.props, updateProp)
  renderComposition(elements.composition, entry)
  updatePropsOutput()
  renderCatalog(elements.search.value)
  scheduleRender(true)
}

function enableEntryWorkspace() {
  elements.search.disabled = false
  elements.viewportPicker.disabled = false
  elements.background.disabled = false
  elements.workspaceEmpty.hidden = true
  elements.previewShell.hidden = false
}

function showEmptyWorkspace() {
  elements.catalogStatus.textContent = 'Workspace vide · prêt'
  elements.search.disabled = true
  elements.viewportPicker.disabled = true
  elements.background.disabled = true
  elements.workspaceEmpty.hidden = false
  elements.previewShell.hidden = true
  elements.workspaceEmptyTitle.textContent = 'Commencez par votre premier composant ou votre première page.'
  elements.workspaceEmptyDescription.textContent = 'Le Showcase est opérationnel sans source projet. Ajoutez un contrat JSON et un template Twig quand vous êtes prêt.'
  elements.componentMeta.textContent = 'Workspace · 0 entrée'
  elements.componentTitle.textContent = 'Design system prêt à démarrer'
  elements.componentDescription.textContent = 'dev/ peut rester vide au début du projet.'
  elements.empty.hidden = false
  elements.empty.textContent = 'Les variables apparaîtront ici dès qu’un composant ou une page sera ajouté.'
  elements.renderStatus.textContent = 'Aucun rendu à générer.'
  elements.htmlStatus.textContent = 'Aucune entrée'
  elements.htmlPre.setAttribute('aria-busy', 'false')
  elements.htmlCode.textContent = '<!-- Ajoutez un composant ou une page pour générer son HTML. -->'
  resetQualityPanel('Aucun rendu à contrôler.')
}

function showWorkspaceError(message) {
  showEmptyWorkspace()
  elements.catalogStatus.textContent = 'Showcase indisponible'
  elements.workspaceEmptyTitle.textContent = 'Le catalogue ne peut pas être chargé.'
  elements.workspaceEmptyDescription.textContent = message
  elements.componentMeta.textContent = 'Erreur de connexion'
  elements.componentTitle.textContent = 'Showcase indisponible'
  elements.componentDescription.textContent = 'Vérifiez que le serveur Vite est lancé.'
  elements.renderStatus.textContent = 'Lancez le Showcase avec npm run dev.'
}

function updateProp(key, value) {
  state.props[key] = value
  forgetSelectedQualityReport()
  updatePropsOutput()
  scheduleRender(false)
}

function resetSelectedEntry() {
  if (!state.selected) return
  state.props = getComponentDefaults(state.selected)
  forgetSelectedQualityReport()
  renderControls(elements.controls, state.selected, state.props, updateProp)
  updatePropsOutput()
  scheduleRender(true)
}

function updatePropsOutput() {
  elements.propsOutput.textContent = JSON.stringify(state.props, null, 2)
}

function scheduleRender(immediate) {
  clearTimeout(state.renderTimer)
  state.renderRevision += 1
  elements.renderStatus.textContent = 'Mise à jour du rendu…'
  invalidateRenderedHtml()
  resetQualityPanel('Le rendu a changé. Relancez les contrôles.')

  if (immediate) {
    sendRender()
    return
  }

  state.renderTimer = setTimeout(sendRender, 120)
}

function sendRender() {
  if (!state.previewReady || !state.selected) return

  elements.previewFrame.contentWindow.postMessage({
    source: SHOWCASE_SOURCE,
    type: SHOWCASE_MESSAGES.render,
    entryType: state.selected.type,
    entryId: state.selected.id,
    props: state.props,
    revision: state.renderRevision
  }, location.origin)
}

function invalidateRenderedHtml() {
  state.renderedHtml = ''
  elements.htmlStatus.textContent = 'Mise à jour…'
  elements.htmlPre.setAttribute('aria-busy', 'true')
  elements.htmlCode.textContent = 'Le HTML sera disponible après le prochain rendu.'
  elements.copyHtml.disabled = true
  elements.copyHtmlStatus.textContent = ''
  elements.qualityButton.disabled = true
}

function updateRenderedHtml(html) {
  state.renderedHtml = normalizeRenderedHtml(html)
  elements.htmlStatus.textContent = 'À jour'
  elements.htmlPre.setAttribute('aria-busy', 'false')
  elements.htmlCode.textContent = state.renderedHtml || '<!-- Le rendu ne produit aucun HTML. -->'
  elements.copyHtml.disabled = !state.renderedHtml
  elements.copyHtmlStatus.textContent = ''
  elements.qualityButton.disabled = !state.renderedHtml
}

function forgetSelectedQualityReport() {
  if (!state.selected) return
  if (state.qualityReports.delete(state.selected.key)) renderCatalog(elements.search.value)
}

function resetQualityPanel(message = 'Lancez les contrôles sur le rendu courant.') {
  clearTimeout(state.qualityTimer)
  state.activeQualityRun = null
  elements.qualityButton.disabled = true
  elements.qualityPanel.setAttribute('aria-busy', 'false')
  elements.qualityStatus.textContent = 'Non testé'
  elements.qualityLive.textContent = message
  setQualityBadge(elements.w3cBadge, 'idle', 'HTML · non testé')
  setQualityBadge(elements.axeBadge, 'idle', 'Axe · non testé')
  elements.w3cSummary.textContent = 'Lancez le contrôle sur le HTML actuellement rendu.'
  elements.axeSummary.textContent = state.selected?.type === 'page'
    ? 'L’analyse porte sur le document complet de la page affichée.'
    : 'L’analyse porte uniquement sur la variante affichée.'
  elements.w3cResults.replaceChildren()
  elements.axeResults.replaceChildren()
}

function runQualityChecks() {
  if (!state.selected || !state.renderedHtml || !state.previewReady) return

  clearTimeout(state.qualityTimer)

  const report = {
    id: ++state.qualityRunId,
    entryKey: state.selected.key,
    entryType: state.selected.type,
    entryName: state.selected.name,
    revision: state.renderRevision,
    w3c: { status: 'pending' },
    axe: { status: 'pending' }
  }

  state.activeQualityRun = report
  state.qualityReports.set(report.entryKey, report)
  elements.qualityOutput.open = true
  elements.qualityPanel.setAttribute('aria-busy', 'true')
  elements.qualityButton.disabled = true
  elements.qualityLive.textContent = 'Contrôles W3C et Axe en cours…'
  renderQualityReport(report)
  renderCatalog(elements.search.value)

  requestAxeAudit(report)

  runW3cCheck(report)
}

function scheduleAutomaticAxeCheck() {
  clearTimeout(state.qualityTimer)
  if (!state.selected || !state.renderedHtml || !state.previewReady) return

  const report = {
    id: ++state.qualityRunId,
    entryKey: state.selected.key,
    entryType: state.selected.type,
    entryName: state.selected.name,
    revision: state.renderRevision,
    w3c: { status: 'idle' },
    axe: { status: 'pending' }
  }

  state.activeQualityRun = report
  state.qualityReports.set(report.entryKey, report)
  elements.qualityPanel.setAttribute('aria-busy', 'true')
  elements.qualityButton.disabled = true
  elements.qualityLive.textContent = 'Analyse Axe locale en cours…'
  renderQualityReport(report)
  renderCatalog(elements.search.value)

  state.qualityTimer = setTimeout(() => requestAxeAudit(report), 240)
}

function requestAxeAudit(report) {
  if (!isActiveQualityRun(report)) return
  elements.previewFrame.contentWindow.postMessage({
    source: SHOWCASE_SOURCE,
    type: SHOWCASE_MESSAGES.audit,
    revision: report.revision
  }, location.origin)
}

async function runW3cCheck(report) {
  try {
    const response = await fetch(SHOWCASE_API.validateHtml, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: state.renderedHtml,
        entryType: report.entryType,
        entryName: report.entryName
      })
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error ?? 'Le contrôle HTML a échoué.')
    if (!isActiveQualityRun(report)) return
    report.w3c = { status: 'done', result: payload }
  } catch (error) {
    if (!isActiveQualityRun(report)) return
    report.w3c = { status: 'error', error: error.message }
  }

  renderQualityReport(report)
}

function isActiveQualityRun(report) {
  return state.activeQualityRun?.id === report.id
    && state.renderRevision === report.revision
    && state.selected?.key === report.entryKey
}

function renderQualityReport(report) {
  if (!isActiveQualityRun(report)) return

  renderW3cState(report.w3c)
  renderAxeState(report.axe)

  const summary = summarizeQualityReport(report)
  elements.qualityStatus.textContent = summary.label
  state.qualityReports.set(report.entryKey, report)

  const pending = report.w3c.status === 'pending' || report.axe.status === 'pending'
  if (pending) return

  elements.qualityPanel.setAttribute('aria-busy', 'false')
  elements.qualityButton.disabled = false
  elements.qualityLive.textContent = report.w3c.status === 'idle'
    ? `${summary.label}. Lancez le contrôle du rendu pour vérifier le HTML W3C. Une revue RGAA manuelle reste nécessaire.`
    : `${summary.label}. Une revue RGAA manuelle reste nécessaire.`
  renderCatalog(elements.search.value)
}

function renderW3cState(check) {
  if (check.status === 'idle') {
    setQualityBadge(elements.w3cBadge, 'idle', 'HTML · non testé')
    elements.w3cSummary.textContent = 'Cliquez sur « Contrôler le rendu » pour appeler le service Nu configuré.'
    elements.w3cResults.replaceChildren()
    return
  }

  if (check.status === 'pending') {
    setQualityBadge(elements.w3cBadge, 'pending', 'HTML · contrôle…')
    elements.w3cSummary.textContent = state.selected?.type === 'page'
      ? 'Validation du document HTML complet…'
      : 'Validation du document encapsulant le composant…'
    elements.w3cResults.replaceChildren()
    return
  }

  if (check.status === 'error') {
    setQualityBadge(elements.w3cBadge, 'review', 'HTML · indisponible')
    elements.w3cSummary.textContent = check.error
    elements.w3cResults.replaceChildren(createQualityMessage('Le résultat Axe reste utilisable. Vérifiez la connexion ou configurez une instance Nu locale.'))
    return
  }

  const { errors, warnings } = check.result
  const status = errors > 0 ? 'fail' : warnings > 0 ? 'review' : 'pass'
  setQualityBadge(elements.w3cBadge, status, errors > 0
    ? `HTML · ${errors} erreur${errors > 1 ? 's' : ''}`
    : warnings > 0
      ? `HTML · ${warnings} alerte${warnings > 1 ? 's' : ''}`
      : 'HTML · aucune erreur')
  elements.w3cSummary.textContent = errors || warnings
    ? `${errors} erreur${errors > 1 ? 's' : ''}, ${warnings} avertissement${warnings > 1 ? 's' : ''}.`
    : 'Aucune erreur ni avertissement signalé par le Nu HTML Checker.'
  renderW3cIssues(check.result.messages)
}

function renderW3cIssues(messages = []) {
  const issues = messages.filter((message) => message.type === 'error' || message.type === 'warning')
  elements.w3cResults.replaceChildren()

  if (!issues.length) {
    elements.w3cResults.append(createQualityMessage('Le HTML est valide dans le contexte de test généré.'))
    return
  }

  for (const issue of issues) {
    const card = createQualityIssue(issue.type)
    const title = document.createElement('h4')
    title.textContent = issue.type === 'error' ? 'Erreur HTML' : 'Avertissement HTML'
    const description = document.createElement('p')
    const location = issue.lastLine ? ` — ligne ${issue.lastLine}` : ''
    description.textContent = `${issue.message}${location}`
    card.append(title, description)

    if (issue.extract) {
      const extract = document.createElement('code')
      extract.textContent = issue.extract
      card.append(extract)
    }

    elements.w3cResults.append(card)
  }
}

function renderAxeState(check) {
  if (check.status === 'pending') {
    setQualityBadge(elements.axeBadge, 'pending', 'Axe · analyse…')
    elements.axeSummary.textContent = 'Analyse du DOM rendu dans l’iframe…'
    elements.axeResults.replaceChildren()
    return
  }

  if (check.status === 'error') {
    setQualityBadge(elements.axeBadge, 'review', 'Axe · indisponible')
    elements.axeSummary.textContent = check.error
    elements.axeResults.replaceChildren(createQualityMessage('Le contrôle HTML W3C reste utilisable.'))
    return
  }

  const violations = check.result.violations ?? []
  const incomplete = check.result.incomplete ?? []
  const violationNodes = violations.reduce((total, item) => total + item.nodes.length, 0)
  const incompleteNodes = incomplete.reduce((total, item) => total + item.nodes.length, 0)
  const status = violationNodes > 0 ? 'fail' : incompleteNodes > 0 ? 'review' : 'pass'
  setQualityBadge(elements.axeBadge, status, violationNodes > 0
    ? `Axe · ${violationNodes} violation${violationNodes > 1 ? 's' : ''}`
    : incompleteNodes > 0
      ? `Axe · ${incompleteNodes} à vérifier`
      : 'Axe · aucune violation')
  elements.axeSummary.textContent = violationNodes || incompleteNodes
    ? `${violationNodes} violation${violationNodes > 1 ? 's' : ''}, ${incompleteNodes} point${incompleteNodes > 1 ? 's' : ''} à vérifier.`
    : `Aucune violation automatique détectée ; ${check.result.passes ?? 0} règles passées.`
  renderAxeIssues(violations, incomplete)
}

function renderAxeIssues(violations = [], incomplete = []) {
  elements.axeResults.replaceChildren()
  const issues = [
    ...violations.map((result) => ({ result, review: false })),
    ...incomplete.map((result) => ({ result, review: true }))
  ]

  if (!issues.length) {
    const scope = state.selected?.type === 'page' ? 'la page affichée' : 'la variante affichée'
    elements.axeResults.append(createQualityMessage(`Axe n’a trouvé aucune violation dans ${scope}.`))
    return
  }

  for (const { result, review } of issues) {
    const severity = review ? 'review' : result.impact
    const card = createQualityIssue(severity)
    const title = document.createElement('h4')
    title.textContent = `${review ? 'À vérifier' : impactLabel(result.impact)} — ${result.help}`
    const description = document.createElement('p')
    description.textContent = result.description
    const count = document.createElement('p')
    count.textContent = `${result.nodes.length} élément${result.nodes.length > 1 ? 's' : ''} concerné${result.nodes.length > 1 ? 's' : ''}.`
    card.append(title, description, count)

    for (const node of result.nodes.slice(0, 3)) {
      const code = document.createElement('code')
      const target = node.target.length ? node.target.join(' ') : 'Cible non fournie'
      code.textContent = `${target}\n${node.html}${node.failureSummary ? `\n${node.failureSummary}` : ''}`
      card.append(code)
    }

    if (isSafeHttpUrl(result.helpUrl)) {
      const help = document.createElement('a')
      help.href = result.helpUrl
      help.target = '_blank'
      help.rel = 'noreferrer'
      help.textContent = 'Documentation de la règle Axe'
      card.append(help)
    }

    elements.axeResults.append(card)
  }
}

function createQualityIssue(severity) {
  const card = document.createElement('article')
  card.className = 'quality-issue'
  card.dataset.severity = severity || 'review'
  return card
}

function createQualityMessage(text) {
  const message = document.createElement('p')
  message.className = 'quality-result__summary'
  message.textContent = text
  return message
}

function setQualityBadge(element, status, text) {
  element.dataset.status = status
  element.textContent = text
}

function impactLabel(impact) {
  return {
    critical: 'Critique',
    serious: 'Sérieux',
    moderate: 'Modéré',
    minor: 'Mineur'
  }[impact] ?? 'Violation'
}

function isSafeHttpUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

async function copyRenderedHtml() {
  if (!state.renderedHtml) return

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(state.renderedHtml)
    } else {
      copyWithTemporaryField(state.renderedHtml)
    }
    elements.copyHtmlStatus.textContent = 'HTML copié.'
  } catch {
    elements.copyHtmlStatus.textContent = 'Copie impossible. Sélectionnez le code pour le copier manuellement.'
  }
}

function copyWithTemporaryField(value) {
  const previousFocus = document.activeElement
  const field = document.createElement('textarea')
  field.className = 'clipboard-helper'
  field.value = value
  field.readOnly = true
  document.body.append(field)
  field.select()
  const copied = document.execCommand('copy')
  field.remove()
  previousFocus?.focus()
  if (!copied) throw new Error('Copie refusée.')
}

function connectPreview() {
  state.previewReady = false
  if (state.selected) {
    state.renderRevision += 1
    elements.renderStatus.textContent = 'Reconnexion au rendu…'
    invalidateRenderedHtml()
    resetQualityPanel('L’iframe a été reconnectée. Relancez les contrôles.')
  }
  elements.previewFrame.contentWindow?.postMessage({
    source: SHOWCASE_SOURCE,
    type: SHOWCASE_MESSAGES.connect
  }, location.origin)
}

function sendPreviewSettings() {
  if (!state.previewReady) return
  elements.previewFrame.contentWindow.postMessage({
    source: SHOWCASE_SOURCE,
    type: SHOWCASE_MESSAGES.settings,
    background: elements.background.value
  }, location.origin)
  if (state.renderedHtml) {
    forgetSelectedQualityReport()
    scheduleAutomaticAxeCheck()
  }
}

function updateViewport(event) {
  if (!event.target.checked) return
  elements.previewShell.style.width = event.target.value === 'auto'
    ? '100%'
    : `${event.target.value}px`
  if (state.renderedHtml) {
    forgetSelectedQualityReport()
    scheduleAutomaticAxeCheck()
  }
}

function handlePreviewMessage(event) {
  if (event.source !== elements.previewFrame.contentWindow) return
  if (event.origin !== location.origin) return
  if (event.data?.source !== SHOWCASE_PREVIEW_SOURCE) return

  if (event.data.type === SHOWCASE_MESSAGES.ready) {
    state.previewReady = true
    sendPreviewSettings()
    sendRender()
    return
  }

  if (event.data.type === SHOWCASE_MESSAGES.rendered) {
    if (!isCurrentRender(event.data.revision, state.renderRevision)) return
    elements.renderStatus.textContent = 'Rendu à jour'
    updateRenderedHtml(event.data.html)
    scheduleAutomaticAxeCheck()
    return
  }

  if (event.data.type === SHOWCASE_MESSAGES.audited) {
    const report = state.activeQualityRun
    if (!report || !isCurrentRender(event.data.revision, report.revision)) return
    if (!isActiveQualityRun(report)) return
    report.axe = {
      status: 'done',
      result: {
        violations: event.data.violations ?? [],
        incomplete: event.data.incomplete ?? [],
        passes: event.data.passes ?? 0
      }
    }
    renderQualityReport(report)
    return
  }

  if (event.data.type === SHOWCASE_MESSAGES.auditError) {
    const report = state.activeQualityRun
    if (!report || !isCurrentRender(event.data.revision, report.revision)) return
    if (!isActiveQualityRun(report)) return
    report.axe = { status: 'error', error: event.data.error ?? 'L’analyse Axe a échoué.' }
    renderQualityReport(report)
    return
  }

  if (event.data.type === SHOWCASE_MESSAGES.error) {
    if (!isCurrentRender(event.data.revision, state.renderRevision)) return
    elements.renderStatus.textContent = `Erreur : ${event.data.error}`
    state.renderedHtml = ''
    elements.htmlStatus.textContent = 'Erreur de rendu'
    elements.htmlPre.setAttribute('aria-busy', 'false')
    elements.htmlCode.textContent = `<!-- ${event.data.error} -->`
    elements.copyHtml.disabled = true
    elements.copyHtmlStatus.textContent = ''
    resetQualityPanel('Le rendu doit être corrigé avant de lancer les contrôles.')
    return
  }

  if (event.data.type === SHOWCASE_MESSAGES.resize) {
    const height = Math.max(448, Math.min(Number(event.data.height) || 448, 900))
    elements.previewFrame.style.height = `${height}px`
  }
}

function createMessage(text, className) {
  const message = document.createElement('p')
  message.className = className
  message.textContent = text
  return message
}
