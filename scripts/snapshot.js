#!/usr/bin/env node
// Capture visuelle et contrôle Axe d'un composant ou d'une page, pour la vérification par un agent.
//
//   npm run snapshot -- button
//   npm run snapshot -- page:home
//   npm run snapshot -- button --widths 390,1280
//   npm run snapshot -- form-field --props '{"error":"Format invalide"}'   (cas supplémentaire)
//
// Utilise le serveur de dev s'il répond (OPENUI_URL, par défaut http://localhost:3000),
// sinon démarre un serveur Vite temporaire.
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { SHOWCASE_API } from '../showcase/shared/protocol.js'

const require = createRequire(import.meta.url)
const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, '.openui/snapshots')

function parseArgs(argv) {
  const args = { target: null, widths: [390, 1280], extraProps: [] }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--widths') args.widths = argv[++i].split(',').map(Number).filter(Boolean)
    else if (argv[i] === '--props') args.extraProps.push(JSON.parse(argv[++i]))
    else if (!args.target) args.target = argv[i]
  }
  return args
}

// Une case par état utile : défauts, chaque option de select, chaque checkbox activée.
export function buildCases(entry, extraProps = []) {
  const cases = [{ label: 'défaut', props: {} }]
  for (const props of extraProps) cases.push({ label: JSON.stringify(props), props })
  for (const [key, control] of Object.entries(entry.variants ?? {})) {
    if (control.type === 'select') {
      for (const option of control.options ?? []) {
        if (option !== control.default) cases.push({ label: `${key}: ${option}`, props: { [key]: option } })
      }
    }
    if (control.type === 'checkbox' && control.default !== true) {
      cases.push({ label: `${key}`, props: { [key]: true } })
    }
  }
  return cases
}

async function isReachable(url) {
  try {
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

async function startServer() {
  const envUrl = process.env.OPENUI_URL ?? 'http://localhost:3000'
  if (await isReachable(envUrl)) return { url: envUrl.replace(/\/$/, ''), close: async () => {} }

  const { createServer } = await import('vite')
  const server = await createServer({ logLevel: 'error', server: { port: 0, strictPort: false } })
  await server.listen()
  return { url: server.resolvedUrls.local[0].replace(/\/$/, ''), close: () => server.close() }
}

async function render(baseUrl, entryType, entryId, props) {
  const response = await fetch(baseUrl + SHOWCASE_API.render, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ entryType, entryId, props })
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error ?? `Rendu impossible (${response.status})`)
  return payload.html
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

async function runAxe(page, selector) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) {
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
  }
  return page.evaluate(async (context) => {
    const result = await window.axe.run(context, { resultTypes: ['violations'] })
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.map((node) => node.target.join(' '))
    }))
  }, selector)
}

async function snapshotComponent(page, baseUrl, entry, widths, extraProps) {
  const cases = buildCases(entry, extraProps)
  const cells = []
  for (const testCase of cases) {
    const html = await render(baseUrl, 'component', entry.id, testCase.props)
    testCase.html = html
    cells.push(`<figure class="openui-snap__case" data-case="${escapeHtml(testCase.label)}"><figcaption>${escapeHtml(testCase.label)}</figcaption><div class="openui-snap__render">${html}</div></figure>`)
  }

  // preview.html charge déjà la feuille du projet : on remplace seulement son contenu.
  await page.goto(`${baseUrl}/showcase/preview.html`)
  await page.waitForLoadState('networkidle')
  await page.evaluate((markup) => {
    const style = document.createElement('style')
    style.textContent = '.preview-placeholder{display:none}.openui-snap{display:grid;gap:16px;padding:16px}.openui-snap__case{display:grid;gap:6px;margin:0}.openui-snap__case figcaption{font:12px/1.4 system-ui,sans-serif;color:#555}'
    document.head.append(style)
    const root = document.querySelector('#preview-root')
    root.innerHTML = `<div class="openui-snap">${markup}</div>`
  }, cells.join(''))
  await page.evaluate(() => document.fonts.ready)

  const files = []
  for (const width of widths) {
    await page.setViewportSize({ width, height: 800 })
    const file = path.join(OUT_DIR, `${entry.id}-${width}.png`)
    await page.screenshot({ path: file, fullPage: true })
    files.push(file)
  }

  // Focus clavier réel (déclenche :focus-visible) sur le premier élément focusable du rendu par défaut.
  await page.setViewportSize({ width: widths.at(-1), height: 800 })
  await page.locator('body').click({ position: { x: 1, y: 1 } })
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.closest('.openui-snap__case') ? document.activeElement.outerHTML.slice(0, 80) : null)
  if (focused) {
    const file = path.join(OUT_DIR, `${entry.id}-focus.png`)
    // Marge autour du cas : l'anneau de focus est dessiné à l'extérieur de l'élément.
    const box = await page.locator('.openui-snap__case').first().boundingBox()
    const margin = 12
    await page.screenshot({
      path: file,
      clip: { x: Math.max(0, box.x - margin), y: Math.max(0, box.y - margin), width: box.width + margin * 2, height: box.height + margin * 2 }
    })
    files.push(file)
  }

  // Axe cas par cas : sur la planche, deux headers ou deux champs dupliqueraient landmarks et id.
  const axe = new Map()
  for (const testCase of cases) {
    await page.evaluate((html) => { document.querySelector('#preview-root').innerHTML = html }, testCase.html)
    for (const violation of await runAxe(page, '#preview-root')) {
      const known = axe.get(violation.id) ?? { ...violation, targets: [] }
      known.targets.push(...violation.targets.map((target) => `[${testCase.label}] ${target}`))
      axe.set(violation.id, known)
    }
  }

  return { files, axe: [...axe.values()], cases: cases.length }
}

async function snapshotPage(page, baseUrl, entry, widths, extraProps) {
  const cases = buildCases(entry, extraProps)
  const files = []
  const axe = new Map()

  for (const [index, testCase] of cases.entries()) {
    const html = await render(baseUrl, 'page', entry.id, testCase.props)
    // Vraie navigation vers l'URL de la page, servie avec le HTML du cas : chemins absolus et
    // modules JS se chargent comme en conditions réelles (setContent ne réexécuterait pas les modules).
    const pageUrl = `${baseUrl}/${encodeURIComponent(entry.id)}.html`
    await page.route(pageUrl, (route) => route.fulfill({ body: html, contentType: 'text/html; charset=utf-8' }))
    await page.goto(pageUrl, { waitUntil: 'networkidle' })
    await page.unroute(pageUrl)
    await page.evaluate(() => document.fonts.ready)

    const suffix = index === 0 ? '' : `-${index}`
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      const file = path.join(OUT_DIR, `page-${entry.id}${suffix}-${width}.png`)
      await page.screenshot({ path: file, fullPage: true })
      files.push(`${file}  (${testCase.label})`)
    }

    for (const violation of await runAxe(page, 'html')) {
      const known = axe.get(violation.id) ?? { ...violation, targets: [] }
      known.targets.push(...violation.targets.map((target) => `[${testCase.label}] ${target}`))
      axe.set(violation.id, known)
    }
  }

  return { files, axe: [...axe.values()], cases: cases.length }
}

async function main() {
  const { target, widths, extraProps } = parseArgs(process.argv.slice(2))
  if (!target) {
    console.error('Usage : npm run snapshot -- <composant> | page:<page> [--widths 390,1280]')
    process.exit(2)
  }
  const [entryType, entryId] = target.startsWith('page:') ? ['page', target.slice(5)] : ['component', target]

  const { chromium } = await import('@playwright/test')
  const server = await startServer()
  const browser = await chromium.launch()

  try {
    const catalog = await (await fetch(server.url + SHOWCASE_API.catalog)).json()
    const entry = catalog.entries.find((candidate) => candidate.type === entryType && candidate.id === entryId)
    if (!entry) throw new Error(`Entrée inconnue : ${entryType}/${entryId}`)

    fs.mkdirSync(OUT_DIR, { recursive: true })
    const page = await browser.newPage()
    const result = entryType === 'page'
      ? await snapshotPage(page, server.url, entry, widths, extraProps)
      : await snapshotComponent(page, server.url, entry, widths, extraProps)

    console.log(`Snapshot ${entryType}/${entryId} — ${result.cases} cas, largeurs ${widths.join(', ')} px`)
    for (const file of result.files) console.log(`  ${path.relative(ROOT, file)}`)
    if (!result.axe.length) {
      console.log('Axe : aucune violation automatique détectée (ne vaut pas conformité RGAA).')
    } else {
      console.log(`Axe : ${result.axe.length} violation(s)`)
      for (const violation of result.axe) {
        console.log(`  ✖ [${violation.impact}] ${violation.id} — ${violation.help}`)
        for (const node of violation.targets.slice(0, 5)) console.log(`      ${node}`)
      }
      process.exitCode = 1
    }
  } finally {
    await browser.close()
    await server.close()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
