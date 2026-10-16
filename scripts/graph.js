import fs from 'fs'
import { buildDesignSystemGraph, GRAPH_PATH, serializeDesignSystemGraph, writeDesignSystemGraph } from './design-system.js'

const checkOnly = process.argv.includes('--check')
const graph = buildDesignSystemGraph()

if (checkOnly) {
  const current = fs.existsSync(GRAPH_PATH) ? fs.readFileSync(GRAPH_PATH, 'utf8') : null

  if (current !== serializeDesignSystemGraph(graph)) {
    console.error('Open UI graph is missing or stale. Run npm run graph.')
    process.exit(1)
  }

  console.log(`Open UI graph current: ${GRAPH_PATH}`)
  process.exit(0)
}

const { changed } = writeDesignSystemGraph(graph)
console.log(`Open UI graph ${changed ? 'updated' : 'current'}: ${GRAPH_PATH}`)
console.log(`${graph.summary.components.total} components, ${graph.summary.pages.total} pages`)
