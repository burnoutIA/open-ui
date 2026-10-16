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

let installed = false

function installDefaultsParser() {
  if (installed) return
  installed = true
  Twig.extend((twig) => {
    const parseTwig = twig.Templates.parsers.twig
    twig.Templates.registerParser('twig', function parseWithDefaults(params) {
      const schema = params.path ? readComponentSchema(path.resolve(params.path)) : null
      if (schema && typeof params.data === 'string') params.data = buildDefaultsPrelude(schema) + params.data
      return parseTwig.call(this, params)
    })
  })
}

// Les includes utilisent des chemins depuis la racine ('dev/components/...') :
// settings.views = root indique à twig 3.x d'utiliser root comme base de résolution.
// Données partagées par toutes les pages (nom du site, navigation...) : dev/data/site.json, exposé sous `site`.
function readSiteData(root) {
  const sitePath = path.join(root, 'dev/data/site.json')
  return fs.existsSync(sitePath) ? JSON.parse(fs.readFileSync(sitePath, 'utf8')) : {}
}

export function renderTwig(root, filePath, data = {}) {
  installDefaultsParser()
  return new Promise((resolve, reject) => {
    Twig.cache(false)
    Twig.renderFile(filePath, { site: readSiteData(root), ...data, settings: { views: root } }, (error, html) => {
      if (error) reject(error)
      else resolve(html)
    })
  })
}
