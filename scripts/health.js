import fs from 'fs'
import path from 'path'
import { collectRefs, collectTwigIncludes, getComponentEntries, getPageEntries } from './design-system.js'

const checks = []
const components = getComponentEntries()
const pages = getPageEntries()
const componentIds = new Set(components.map((component) => component.id))
const stylePath = path.join(process.cwd(), 'dev/assets/scss/style.scss')
const styleContent = fs.existsSync(stylePath) ? fs.readFileSync(stylePath, 'utf8') : ''
const allowedStatuses = new Set(['canonical', 'draft', 'sketch'])

function add(status, scope, file, message, detail = '') {
  checks.push({ status, scope, file, message, detail })
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function basenameNoExt(filePath) {
  return path.basename(filePath, path.extname(filePath))
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function expectedNameFromId(id) {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function checkRequiredJson(file, schema, fields) {
  for (const field of fields) {
    if (!hasText(schema[field])) add('error', 'json', file, `Champ obligatoire manquant: ${field}`)
  }
}

function checkControls(file, groupName, controls = {}) {
  if (!controls || typeof controls !== 'object') return

  for (const [key, control] of Object.entries(controls)) {
    const label = `${groupName}.${key}`

    if (!control || typeof control !== 'object') {
      add('error', 'json', file, `${label} doit être un objet`)
      continue
    }

    if (!hasText(control.label)) add('warn', 'json', file, `${label} sans label lisible`)
    if (!hasText(control.type)) add('error', 'json', file, `${label} sans type`)
    if (!Object.hasOwn(control, 'default')) add('warn', 'json', file, `${label} sans valeur par défaut`)
  }
}

function checkDocumentation(mdPath) {
  if (!fs.existsSync(mdPath)) {
    add('error', 'docs', mdPath, 'Documentation absente')
    return
  }

  const content = fs.readFileSync(mdPath, 'utf8')
  if (countWords(content) < 20) add('warn', 'docs', mdPath, 'Documentation trop courte', 'minimum recommandé: 20 mots')
  if (!/^#\s+.+/m.test(content)) add('warn', 'docs', mdPath, 'Documentation sans titre H1')

  const requiredSections = [
    ['Usage'],
    ['Props', 'Contrôles', 'Controles', 'Paramètres', 'Parametres'],
    ['Accessibilité', 'Accessibilite'],
    ['Exemples', 'Examples']
  ]
  for (const aliases of requiredSections) {
    const hasSection = aliases.some((title) => new RegExp(`^##\\s+${title}\\b`, 'im').test(content))
    if (!hasSection) add('warn', 'docs', mdPath, `Section recommandée absente: ${aliases[0]}`)
  }
}

function hasScssImport(scssPath) {
  const kind = path.basename(path.dirname(scssPath))
  const id = path.basename(scssPath, '.scss').replace(/^_/, '')
  return new RegExp(`@use\\s+['\"]${kind}/${id}['\"]`).test(styleContent)
}

function scssImportHint(scssPath) {
  return `@use '${path.basename(path.dirname(scssPath))}/${path.basename(scssPath, '.scss').replace(/^_/, '')}';`
}

function checkStatus(file, schema, scope) {
  if (!schema.status) {
    if (scope === 'component') add('warn', 'json', file, 'Status absent, traité comme canonical temporairement')
    return
  }
  if (!allowedStatuses.has(schema.status)) add('error', 'json', file, `Status non supporté: ${schema.status}`)
  if (scope === 'component' && schema.status === 'sketch') add('error', 'json', file, 'Un composant dans dev/components ne peut pas être status=sketch')
  if (scope === 'page' && schema.status === 'sketch') add('error', 'json', file, 'Une page canonique ne peut pas être status=sketch')
}

function checkRefs(file, refs) {
  for (const ref of refs) {
    if (ref !== 'grid' && !componentIds.has(ref)) add('error', 'refs', file, `Référence inconnue: ${ref}`)
  }
}

function checkComponent(component) {
  const { id, jsonPath, twigPath, scssPath, mdPath, schema } = component
  const dirName = path.basename(component.dir)
  const twigName = basenameNoExt(twigPath)

  if (dirName !== id) add('error', 'naming', jsonPath, 'Dossier et id JSON divergents', `${dirName} ≠ ${id}`)
  if (twigName !== id) add('error', 'naming', twigPath, 'Twig attendu au nom du composant', `${twigName} ≠ ${id}`)

  checkRequiredJson(jsonPath, schema, ['name', 'level', 'category', 'description'])

  if (hasText(schema.name) && schema.name !== expectedNameFromId(id)) {
    add('warn', 'naming', jsonPath, 'Nom JSON possiblement incohérent avec le slug', `attendu proche de "${expectedNameFromId(id)}"`)
  }

  if (!fs.existsSync(twigPath)) add('error', 'files', twigPath, 'Template Twig absent')
  checkStatus(jsonPath, schema, 'component')

  if (!fs.existsSync(scssPath)) add('error', 'files', scssPath, 'SCSS composant absent')
  if (fs.existsSync(scssPath) && !hasScssImport(scssPath)) {
    add('error', 'scss', stylePath, `Import SCSS manquant pour ${id}`, scssImportHint(scssPath))
  }

  checkDocumentation(mdPath)
  checkControls(jsonPath, 'variants', schema.variants)
  checkControls(jsonPath, 'content', schema.content)
  checkRefs(jsonPath, collectRefs(schema))
  checkRefs(twigPath, collectTwigIncludes(twigPath))
}

function checkPage(page) {
  const { id, jsonPath, twigPath, scssPath, schema } = page

  checkRequiredJson(jsonPath, schema, ['name', 'description'])
  checkStatus(jsonPath, schema, 'page')
  if (!fs.existsSync(twigPath)) add('error', 'files', twigPath, 'Template Twig absent')
  if (fs.existsSync(scssPath) && !hasScssImport(scssPath)) {
    add('error', 'scss', stylePath, `Import SCSS de page manquant pour ${id}`, scssImportHint(scssPath))
  }
  checkControls(jsonPath, 'variants', schema.variants)
  checkControls(jsonPath, 'content', schema.content)
  checkRefs(jsonPath, collectRefs(schema))
  checkRefs(twigPath, collectTwigIncludes(twigPath))
}

// Un workspace vide est valide : le point d'entrée SCSS ne devient obligatoire qu'avec du contenu.
if ((components.length || pages.length) && !fs.existsSync(stylePath)) add('error', 'scss', stylePath, 'Point d’entrée SCSS absent')
for (const component of components) checkComponent(component)
for (const page of pages) checkPage(page)

const totals = checks.reduce((acc, check) => {
  acc[check.status] += 1
  return acc
}, { error: 0, warn: 0 })

console.log('Design system health')
console.log('====================')
console.log(`Components: ${components.length}`)
console.log(`Pages:      ${pages.length}`)
console.log(`Errors:     ${totals.error}`)
console.log(`Warnings:   ${totals.warn}`)
console.log('')

if (!checks.length) {
  console.log('OK — aucune dette structurelle critique détectée.')
} else {
  const byScope = Map.groupBy(checks, (check) => check.scope)

  for (const [scope, scopedChecks] of byScope) {
    console.log(scope.toUpperCase())
    for (const check of scopedChecks) {
      const marker = check.status === 'error' ? '✖' : '⚠'
      const detail = check.detail ? ` (${check.detail})` : ''
      console.log(`  ${marker} ${check.file}: ${check.message}${detail}`)
    }
    console.log('')
  }
}

if (totals.error > 0) process.exit(1)
