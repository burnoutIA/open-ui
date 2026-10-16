import fs from 'fs'
import path from 'path'
import Twig from 'twig'

// Rendu Twig d'Open UI. Le JSON d'un composant ou d'une page est la seule source de ses valeurs par défaut :
// à chaque chargement de dev/components/<id>/<id>.twig ou dev/pages/<id>.twig, un prélude définit les props
// non passées avec le `default` déclaré dans <id>.json. Le composant inclus depuis une page (même avec `only`)
// a donc les mêmes défauts que dans le Showcase. Une valeur passée, même '' ou false, est respectée.

const COMPONENT_TEMPLATE = /[\\/]dev[\\/]components[\\/]([^\\/]+)[\\/]\1\.twig$/
const PAGE_TEMPLATE = /[\\/]dev[\\/]pages[\\/]([^\\/]+)\.twig$/

function toTwigLiteral(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'").replaceAll('\n', '\\n').replaceAll('\r', '\\r').replaceAll('\t', '\\t')}'`
  }
  if (Array.isArray(value)) return `[${value.map(toTwigLiteral).join(', ')}]`
  return `{${Object.entries(value).map(([key, item]) => `${toTwigLiteral(key)}: ${toTwigLiteral(item)}`).join(', ')}}`
}

// Une seule ligne, sans sortie : les numéros de ligne des erreurs Twig restent ceux du fichier.
export function buildDefaultsPrelude(schema) {
  const controls = { ...schema?.variants, ...schema?.content }
  return Object.entries(controls)
    .filter(([name, control]) => /^[A-Za-z_]\w*$/.test(name) && control && Object.hasOwn(control, 'default'))
    .map(([name, control]) => `{% set ${name} = ${name} ?? ${toTwigLiteral(control.default)} %}`)
    .join('')
}

function readComponentSchema(templatePath) {
  const match = templatePath.match(COMPONENT_TEMPLATE) ?? templatePath.match(PAGE_TEMPLATE)
  if (!match) return null
  const jsonPath = path.join(path.dirname(templatePath), `${match[1]}.json`)
  if (!fs.existsSync(jsonPath)) return null
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
}

// Instances de composants d'une page : dans dev/pages/ et dev/layouts/, chaque
// `{% include 'dev/components/<id>/<id>.twig' with { ... } only %}` devient
// `{% include ... with openui_instance(__openui, '<fichier>#<n>', '<id>', { ... }) only %}`.
// En rendu Showcase, __openui porte les modifications de l'utilisateur et reçoit la liste des instances ;
// ailleurs (build, route de page), la fonction rend les props telles quelles.
const COMPOSING_TEMPLATE = /[\\/]dev[\\/](?:pages|layouts)[\\/]/
const COMPONENT_INCLUDE = /\{%(-?)\s*include\s+(['"])(dev\/components\/([^/'"]+)\/[^'"]+\.twig)\2([\s\S]*?)(-?)%\}/g

export function instrumentIncludes(source, file) {
  let index = 0
  return source.replace(COMPONENT_INCLUDE, (tag, open, quote, template, componentId, rest, close) => {
    const clause = rest.match(/^\s+with\s+([\s\S]*?)(\s+only)?\s*$/)
    if (!clause && rest.trim()) return tag
    const props = clause ? clause[1] : '{}'
    const only = clause ? clause[2] ?? '' : ''
    const key = `${file}#${index++}`
    return `{%${open} include ${quote}${template}${quote} with openui_instance(__openui, '${key}', '${componentId}', ${props})${only} ${close}%}`
  })
}

function declaredControls(componentId, root) {
  const jsonPath = path.join(root, 'dev/components', componentId, `${componentId}.json`)
  if (!fs.existsSync(jsonPath)) return new Set()
  const schema = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  return new Set([...Object.keys(schema.variants ?? {}), ...Object.keys(schema.content ?? {})])
}

// Valeur Twig copiée en données JSON simples pour l'API (sans la propriété interne `_keys` de twig.js).
function plain(value) {
  return JSON.parse(JSON.stringify(value ?? {}, (key, item) => (key === '_keys' ? undefined : item)))
}

let installed = false

function installOpenUITwig() {
  if (installed) return
  installed = true
  Twig.extend((twig) => {
    const parseTwig = twig.Templates.parsers.twig
    twig.Templates.registerParser('twig', function parseWithOpenUI(params) {
      if (typeof params.data === 'string' && params.path) {
        const absolute = path.resolve(params.path)
        const schema = readComponentSchema(absolute)
        if (schema) params.data = buildDefaultsPrelude(schema) + params.data
        if (COMPOSING_TEMPLATE.test(absolute)) {
          const file = absolute.slice(absolute.replaceAll('\\', '/').lastIndexOf('/dev/') + 1).replaceAll('\\', '/')
          params.data = instrumentIncludes(params.data, file)
        }
      }
      return parseTwig.call(this, params)
    })
  })

  Twig.extendFunction('openui_instance', (state, key, componentId, props) => {
    if (!state || typeof state !== 'object') return props
    const base = props && typeof props === 'object' ? props : {}
    // Une instance dans une boucle a une seule clé : on note la première occurrence.
    if (!state.instances.some((instance) => instance.key === key)) {
      state.instances.push({ key, component: componentId, props: plain(base) })
    }
    const override = state.overrides?.[key]
    if (!override || typeof override !== 'object') return base
    const allowed = declaredControls(componentId, state.root)
    return { ...base, ...Object.fromEntries(Object.entries(override).filter(([name]) => allowed.has(name))) }
  })
}

// Données partagées par toutes les pages (nom du site, navigation...) : dev/data/site.json, exposé sous `site`.
function readSiteData(root) {
  const sitePath = path.join(root, 'dev/data/site.json')
  return fs.existsSync(sitePath) ? JSON.parse(fs.readFileSync(sitePath, 'utf8')) : {}
}

// Les includes utilisent des chemins depuis la racine ('dev/components/...') :
// settings.views = root indique à twig 3.x d'utiliser root comme base de résolution.
// `instances` (rendu Showcase) : { overrides } en entrée ; la liste des instances rendues y est ajoutée.
export function renderTwig(root, filePath, data = {}, instances = null) {
  installOpenUITwig()
  return new Promise((resolve, reject) => {
    Twig.cache(false)
    const __openui = instances ? Object.assign(instances, { root, instances: [] }) : null
    Twig.renderFile(filePath, { site: readSiteData(root), ...data, __openui, settings: { views: root } }, (error, html) => {
      if (error) reject(error)
      else resolve(html)
    })
  })
}
