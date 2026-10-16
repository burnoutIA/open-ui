import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'

export const ROOT = process.cwd()
export const COMPONENTS_DIR = path.join(ROOT, 'dev/components')
export const PAGES_DIR = path.join(ROOT, 'dev/pages')
export const SCSS_DIR = path.join(ROOT, 'dev/assets/scss')
export const GRAPH_PATH = path.join(ROOT, '.openui/graph.json')
export const DESIGN_SYSTEM_STATUSES = ['todo', 'in-progress', 'done']
const SYSTEM_DEPENDENCIES = new Set(['grid'])

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export function kebabFromFile(filePath) {
  return path.basename(filePath, '.json')
}

export function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) return listJsonFiles(entryPath)
      if (entry.isFile() && entry.name.endsWith('.json')) return [entryPath]
      return []
    })
    .sort()
}

export function getComponentEntries() {
  return listJsonFiles(COMPONENTS_DIR).map((jsonPath) => {
    const id = kebabFromFile(jsonPath)
    const dir = path.dirname(jsonPath)
    return {
      id,
      dir,
      jsonPath,
      twigPath: path.join(dir, `${id}.twig`),
      mdPath: path.join(dir, `${id}.md`),
      scssPath: path.join(SCSS_DIR, 'components', `_${id}.scss`),
      schema: readJson(jsonPath)
    }
  })
}

export function getPageEntries() {
  return listJsonFiles(PAGES_DIR).map((jsonPath) => {
    const id = kebabFromFile(jsonPath)
    const dir = path.dirname(jsonPath)
    return {
      id,
      dir,
      jsonPath,
      twigPath: path.join(dir, `${id}.twig`),
      mdPath: path.join(dir, `${id}.md`),
      scssPath: path.join(SCSS_DIR, 'components', `_${id}-page.scss`),
      schema: readJson(jsonPath)
    }
  })
}

export function collectRefs(schema) {
  const refs = new Set()

  for (const part of Object.values(schema.parts ?? {})) {
    if (part.component) refs.add(part.component)
  }

  for (const collection of Object.values(schema.collections ?? {})) {
    if (collection.itemComponent) refs.add(collection.itemComponent)
    if (collection.component) refs.add(collection.component)
  }

  for (const family of Object.values(schema.families ?? {})) {
    if (family.component) refs.add(family.component)
  }

  for (const instance of Object.values(schema.instances ?? {})) {
    if (instance.component) refs.add(instance.component)
  }

  for (const group of Object.values(schema.layoutGroups ?? {})) {
    if (group.component) refs.add(group.component)
  }

  for (const control of Object.values(schema.content ?? {})) {
    if (control.ref) refs.add(control.ref)
  }

  return [...refs].sort()
}

export function collectTwigIncludes(twigPath) {
  if (!fs.existsSync(twigPath)) return []
  const content = fs.readFileSync(twigPath, 'utf8')
  const refs = new Set()
  const includeRe = /include\s+['"]dev\/components\/([^/]+)\/[^'"]+['"]/g
  for (const match of content.matchAll(includeRe)) refs.add(match[1])
  return [...refs].sort()
}

function projectPath(filePath) {
  const relative = path.isAbsolute(filePath) ? path.relative(ROOT, filePath) : filePath
  return relative.split(path.sep).join('/')
}

function directUses(entry, componentIds) {
  const refs = [...new Set([...collectRefs(entry.schema), ...collectTwigIncludes(entry.twigPath)])]
  const unknown = refs.filter((id) => !componentIds.has(id) && !SYSTEM_DEPENDENCIES.has(id))

  if (unknown.length) {
    throw new Error(`${entry.id} references unknown components: ${unknown.join(', ')}`)
  }

  return refs.filter((id) => componentIds.has(id)).sort()
}

function transitiveUses(initialIds, usesByComponent) {
  const found = new Set()
  const pending = [...initialIds]

  while (pending.length) {
    const id = pending.pop()
    if (found.has(id)) continue
    found.add(id)
    pending.push(...(usesByComponent.get(id) ?? []))
  }

  return [...found].sort()
}

function statusCounts(entries) {
  const counts = { total: entries.length, todo: 0, 'in-progress': 0, done: 0 }
  for (const entry of entries) counts[entry.status] = (counts[entry.status] ?? 0) + 1
  return counts
}

function entryStatus(entry) {
  const status = entry.schema.status ?? 'done'

  if (!DESIGN_SYSTEM_STATUSES.includes(status)) {
    throw new Error(`${entry.id} has unsupported status: ${status}`)
  }

  return status
}

function assertUniqueIds(entries, type) {
  const seen = new Set()

  for (const entry of entries) {
    if (seen.has(entry.id)) throw new Error(`Duplicate ${type} id: ${entry.id}`)
    seen.add(entry.id)
  }
}

export function buildDesignSystemGraph(sources = {}) {
  const components = [...(sources.components ?? getComponentEntries())]
    .sort((left, right) => left.id.localeCompare(right.id))
  const pages = [...(sources.pages ?? getPageEntries())]
    .sort((left, right) => left.id.localeCompare(right.id))
  assertUniqueIds(components, 'component')
  assertUniqueIds(pages, 'page')
  const componentIds = new Set(components.map((component) => component.id))
  const usesByComponent = new Map(components.map((component) => [
    component.id,
    directUses(component, componentIds)
  ]))
  const usedByComponent = new Map(components.map((component) => [component.id, new Set()]))

  for (const [parentId, childIds] of usesByComponent) {
    for (const childId of childIds) usedByComponent.get(childId).add(parentId)
  }

  const pageNodes = Object.fromEntries(pages.map((page) => {
    const uses = transitiveUses(directUses(page, componentIds), usesByComponent)
    return [page.id, {
      name: page.schema.name ?? page.id,
      status: entryStatus(page),
      file: projectPath(page.jsonPath),
      uses
    }]
  }))

  const componentNodes = Object.fromEntries(components.map((component) => {
    const id = component.id
    const usedByPages = Object.entries(pageNodes)
      .filter(([, page]) => page.uses.includes(id))
      .map(([pageId]) => pageId)

    return [id, {
      name: component.schema.name ?? id,
      level: component.schema.level ?? 'unknown',
      category: component.schema.category ?? 'unknown',
      status: entryStatus(component),
      file: projectPath(component.jsonPath),
      uses: usesByComponent.get(id),
      usedBy: [...usedByComponent.get(id)].sort(),
      pages: usedByPages
    }]
  }))

  const sourceHash = createHash('sha256').update(JSON.stringify({
    components: components.map((component) => ({
      id: component.id,
      schema: component.schema,
      uses: usesByComponent.get(component.id)
    })),
    pages: pages.map((page) => ({
      id: page.id,
      schema: page.schema,
      uses: pageNodes[page.id].uses
    }))
  })).digest('hex')

  return {
    version: 1,
    sourceHash,
    summary: {
      components: statusCounts(Object.values(componentNodes)),
      pages: statusCounts(Object.values(pageNodes))
    },
    components: componentNodes,
    pages: pageNodes
  }
}

export function serializeDesignSystemGraph(graph) {
  return `${JSON.stringify(graph)}\n`
}

export function collectTransitiveDependents(graph, target) {
  const found = new Set()
  const pending = [...(graph.components[target]?.usedBy ?? [])]

  while (pending.length) {
    const id = pending.pop()
    if (found.has(id)) continue
    found.add(id)
    pending.push(...(graph.components[id]?.usedBy ?? []))
  }

  return [...found].sort()
}

export function writeDesignSystemGraph(graph = buildDesignSystemGraph()) {
  const content = serializeDesignSystemGraph(graph)
  const current = fs.existsSync(GRAPH_PATH) ? fs.readFileSync(GRAPH_PATH, 'utf8') : null

  if (current === content) return { graph, changed: false }

  fs.mkdirSync(path.dirname(GRAPH_PATH), { recursive: true })
  fs.writeFileSync(GRAPH_PATH, content, 'utf8')
  return { graph, changed: true }
}
