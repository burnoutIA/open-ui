// Chaque composant et chaque page du workspace, dans chacun de ses cas, rendu et contrôlé par Axe ;
// puis ouvert dans le Showcase : badge Axe, aucune erreur JavaScript, une seule zone de défilement.
// La liste vient du disque : le test suit le contenu de dev/ sans rien déclarer.
import { expect, test } from '@playwright/test'
import fs from 'fs'
import { getComponentEntries, getPageEntries, OPENUI_CONFIG } from '../../scripts/design-system.js'
import { buildCases, render, runAxe } from '../../scripts/snapshot.js'

const entries = [
  ...getComponentEntries().map((entry) => ({ ...entry, ...entry.schema, type: 'component' })),
  ...getPageEntries().map((entry) => ({ ...entry, ...entry.schema, type: 'page' }))
]

function collectPageErrors(page) {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

function formatViolations(violations) {
  return violations.map((violation) => `${violation.id} (${violation.impact}) : ${violation.targets.join(', ')}`)
}

test.describe('workspace vide', () => {
  test.skip(entries.length > 0, 'le workspace contient des composants ou des pages')

  test('le Showcase affiche l’état de démarrage', async ({ page }) => {
    const errors = collectPageErrors(page)
    await page.goto('/showcase/')
    await expect(page.locator('#workspace-empty')).toBeVisible()
    expect(errors).toEqual([])
  })
})

for (const entry of entries) {
  const label = `${entry.type} ${entry.id}`

  test(`${label} : chaque cas passe Axe`, async ({ page, baseURL }) => {
    const errors = collectPageErrors(page)
    const failures = []

    for (const testCase of buildCases(entry)) {
      const html = await render(baseURL, entry.type, entry.id, testCase.props)

      if (entry.type === 'page') {
        const pageUrl = `${baseURL}/${encodeURIComponent(entry.id)}.html`
        await page.route(pageUrl, (route) => route.fulfill({ body: html, contentType: 'text/html; charset=utf-8' }))
        await page.goto(pageUrl, { waitUntil: 'networkidle' })
        await page.unroute(pageUrl)
      } else {
        await page.goto('/showcase/preview.html', { waitUntil: 'networkidle' })
        await page.evaluate(({ markup, level }) => {
          const root = document.querySelector('#preview-root')
          root.dataset.level = level
          document.body.dataset.entryType = 'component'
          root.innerHTML = markup
        }, { markup: html, level: entry.level })
      }

      const violations = await runAxe(page, entry.type === 'page' ? 'html' : '#preview-root')
      if (violations.length) failures.push(`[${testCase.label}] ${formatViolations(violations).join(' | ')}`)
    }

    expect(failures, 'violations Axe').toEqual([])
    expect(errors, 'erreurs JavaScript').toEqual([])
  })

  test(`${label} : s’ouvre proprement dans le Showcase`, async ({ page }) => {
    const errors = collectPageErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`/showcase/#${encodeURIComponent(`${entry.type}:${entry.id}`)}`)

    const badge = page.locator('#axe-badge')
    await expect(badge).toHaveAttribute('data-status', /^(pass|review|fail)$/, { timeout: 20_000 })
    await expect(badge, 'Axe doit tourner dans le Showcase').not.toHaveText(/indisponible/)
    await expect(badge).toHaveAttribute('data-status', /^(pass|review)$/)
    await expect(page.locator('#component-meta')).not.toContainText('undefined')
    // Composant dans son conteneur, page sans défilement horizontal.
    await expect(page.locator('#overflow-badge')).toHaveText('Débordement · aucun')

    // Une seule zone de défilement : ni le document d'aperçu ni l'iframe d'une page ne défilent.
    const preview = page.frames().find((frame) => frame.url().includes('/showcase/preview.html'))
    const overflow = await preview.evaluate(() => {
      const scrolls = (doc) => doc.documentElement.scrollHeight > doc.documentElement.clientHeight + 1
      const pageFrame = document.querySelector('#page-preview')
      return {
        preview: scrolls(document),
        page: !pageFrame.hidden && pageFrame.contentDocument ? scrolls(pageFrame.contentDocument) : false
      }
    })
    expect(overflow).toEqual({ preview: false, page: false })
    expect(errors, 'erreurs JavaScript').toEqual([])
  })
}

for (const entry of entries.filter((candidate) => candidate.type === 'page')) {
  test(`page ${entry.id} : ses composants se modifient depuis le Showcase`, async ({ page }) => {
    const errors = collectPageErrors(page)
    await page.goto(`/showcase/#${encodeURIComponent(`page:${entry.id}`)}`)

    const instances = page.locator('#instances-container details')
    await expect(instances.first(), 'composants de la page détectés au rendu').toBeVisible({ timeout: 20_000 })

    // Première instance qui a un texte stressable : son stress doit changer le rendu de la page.
    const stressable = instances.filter({ has: page.locator('.control__stress') }).first()
    await stressable.locator('summary').click()
    const pageFrame = () => page.frames().find((frame) => frame.parentFrame()?.url().includes('/showcase/preview.html'))
    await stressable.locator('.control__stress .stress-button').first().click()
    await expect.poll(async () => (await pageFrame()?.content()) ?? '', { timeout: 10_000 }).toContain('Lorem ipsum dolor')

    await stressable.locator('.control__stress .stress-button').nth(1).click()
    await expect.poll(async () => (await pageFrame()?.content()) ?? '', { timeout: 10_000 }).not.toContain('Lorem ipsum dolor')
    expect(errors, 'erreurs JavaScript').toEqual([])
  })
}

test('design tokens : page des fondations', async ({ page }) => {
  test.skip(!fs.existsSync(OPENUI_CONFIG.tokensFile), 'pas de fichier de tokens')
  const errors = collectPageErrors(page)
  await page.goto(`/showcase/#${encodeURIComponent('tokens:tokens')}`)
  await expect(page.locator('#component-title')).toHaveText('Design tokens')

  const preview = page.frameLocator('#preview-frame')
  await expect(preview.locator('.ot-section').first()).toBeVisible({ timeout: 20_000 })
  await expect(preview.locator('.ot-swatch').first(), 'palette affichée').toBeVisible()
  // Seul contrôle pertinent : les contrastes des rôles ; Axe, W3C et débordement sont masqués.
  await expect(page.locator('#contrast-badge')).toHaveText(/^Contrastes · \d+\/\d+ conformes$/, { timeout: 20_000 })
  await expect(page.locator('#contrast-badge')).toHaveAttribute('data-status', 'pass')
  await expect(page.locator('[data-entry-key="tokens:tokens"] .component-button__quality'), 'badge du catalogue').toHaveText('OK')
  for (const hidden of ['#axe-badge', '#w3c-badge', '#overflow-badge', '#run-quality', '#quality-output', '#html-output']) {
    await expect(page.locator(hidden)).toBeHidden()
  }
  await expect(preview.locator('.ot-contrast__pair--fail'), 'aucun contraste insuffisant').toHaveCount(0)
  expect(errors, 'erreurs JavaScript').toEqual([])
})
