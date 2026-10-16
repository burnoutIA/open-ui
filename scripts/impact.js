import { collectTransitiveDependents, writeDesignSystemGraph } from './design-system.js'

const target = process.argv[2]
const { graph } = writeDesignSystemGraph()

if (!target) {
  const impacts = Object.fromEntries(Object.entries(graph.components).map(([id, component]) => [id, {
    components: collectTransitiveDependents(graph, id),
    pages: component.pages
  }]))
  console.log(JSON.stringify(impacts, null, 2))
  process.exit(0)
}

if (!graph.components[target]) {
  console.error(`Unknown component: ${target}`)
  process.exit(1)
}

const impacts = graph.components[target]
const dependentComponents = collectTransitiveDependents(graph, target)
console.log(`# Impact: ${target}`)
console.log('')
console.log(`Components: ${dependentComponents.length ? dependentComponents.join(', ') : 'none'}`)
console.log(`Pages: ${impacts.pages.length ? impacts.pages.join(', ') : 'none'}`)
