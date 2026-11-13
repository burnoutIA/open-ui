import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { collectRefs, collectTwigIncludes } from '../../scripts/design-system.js'

// Empreinte des sources d'une entrée du catalogue : ses fichiers, ceux des composants qu'elle utilise
// (transitivement, gabarits compris), et les fichiers globaux (styles hors composants, polices, scripts,
// données du site). Le Showcase garde le dernier résultat de contrôle tant que l'empreinte ne change pas.

function walk(dir, skip = () => false) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    if (skip(file)) return []
    return entry.isDirectory() ? walk(file, skip) : [file]
  })
}

function hashFiles(files, root) {
  const hash = createHash('sha1')
  for (const file of [...new Set(files)].sort()) {
    hash.update(path.relative(root, file))
    hash.update(fs.existsSync(file) ? fs.readFileSync(file) : '∅')
  }
  return hash.digest('hex').slice(0, 16)
}

export function computeSourceVersions({ components, pages, config, root = process.cwd() }) {
  const styleDir = path.dirname(config.styleEntry)
  const componentStyles = path.join(styleDir, 'components')
  const globalFiles = [
    ...walk(styleDir, (file) => file === componentStyles),
    ...walk(path.join(root, 'dev/assets/fonts')),
    config.scriptEntry,
    path.join(root, 'dev/data/site.json')
  ]

  const byId = new Map(components.map((component) => [component.id, component]))
  const ownFiles = (entry) => [
    entry.jsonPath, entry.twigPath, entry.mdPath, entry.jsPath,
    path.join(componentStyles, `_${entry.id}.scss`), path.join(componentStyles, `_${entry.id}-page.scss`)
  ].filter(Boolean)

  function dependencyFiles(entry, seen = new Set()) {
    const files = [...ownFiles(entry)]
    for (const id of [...collectRefs(entry.schema), ...collectTwigIncludes(entry.twigPath)]) {
      if (seen.has(id) || !byId.has(id)) continue
      seen.add(id)
      files.push(...dependencyFiles(byId.get(id), seen))
    }
    return files
  }

  const layouts = walk(path.join(root, 'dev/layouts'))
  const versions = {}
  for (const component of components) versions[`component:${component.id}`] = hashFiles([...globalFiles, ...dependencyFiles(component)], root)
  for (const page of pages) versions[`page:${page.id}`] = hashFiles([...globalFiles, ...layouts, ...dependencyFiles(page)], root)
  versions['tokens:tokens'] = hashFiles([...globalFiles, config.tokensFile], root)
  return versions
}
