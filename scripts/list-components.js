import { writeDesignSystemGraph } from './design-system.js'

const { graph } = writeDesignSystemGraph()
const components = Object.entries(graph.components)
const pages = Object.entries(graph.pages)

console.log('# Open UI component map')
console.log('')
console.log(`Components: ${components.length}`)
console.log(`Pages: ${pages.length}`)
console.log('')

for (const [id, component] of components) {
  console.log(`## ${id}`)
  console.log(`- name: ${component.name}`)
  console.log(`- level: ${component.level}`)
  console.log(`- category: ${component.category}`)
  console.log(`- status: ${component.status}`)
  console.log(`- refs: ${component.uses.length ? component.uses.join(', ') : 'none'}`)
  console.log(`- used by components: ${component.usedBy.length ? component.usedBy.join(', ') : 'none'}`)
  console.log(`- used by pages: ${component.pages.length ? component.pages.join(', ') : 'none'}`)
  console.log('')
}

console.log('# Pages')
console.log('')
for (const [id, page] of pages) {
  console.log(`## ${id}`)
  console.log(`- name: ${page.name}`)
  console.log(`- status: ${page.status}`)
  console.log(`- refs: ${page.uses.length ? page.uses.join(', ') : 'none'}`)
  console.log('')
}
