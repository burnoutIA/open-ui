import path from 'path'
import { describe, expect, it } from 'vitest'
import { buildDesignSystemGraph, collectTransitiveDependents, listJsonFiles } from './design-system.js'

describe('empty design-system workspace', () => {
  it('accepte un dossier dev/components absent', () => {
    const missingComponents = path.join(process.cwd(), 'dev/__openui_missing__/components')

    expect(listJsonFiles(missingComponents)).toEqual([])
  })

  it('cartographie les dependances transitives et les statuts', () => {
    const entry = (id, schema, type = 'components') => ({
      id,
      schema,
      jsonPath: `dev/${type}/${id}/${id}.json`,
      twigPath: `dev/__missing__/${id}.twig`
    })
    const components = [
      entry('input', { name: 'Input', level: 'atom', category: 'Forms' }),
      entry('form-field', {
        name: 'Form field',
        level: 'molecule',
        category: 'Forms',
        parts: { field: { component: 'input' } }
      }),
      entry('form', {
        name: 'Form',
        level: 'organism',
        category: 'Forms',
        status: 'in-progress',
        parts: { field: { component: 'form-field' } }
      })
    ]
    const pages = [entry('contact', {
      name: 'Contact',
      status: 'todo',
      parts: { form: { component: 'form' } }
    }, 'pages')]

    const graph = buildDesignSystemGraph({ components, pages })

    expect(graph.components.input.usedBy).toEqual(['form-field'])
    expect(graph.components.input.pages).toEqual(['contact'])
    expect(collectTransitiveDependents(graph, 'input')).toEqual(['form', 'form-field'])
    expect(graph.components.form.status).toBe('in-progress')
    expect(graph.pages.contact.uses).toEqual(['form', 'form-field', 'input'])
    expect(graph.summary.components).toEqual({ total: 3, todo: 0, 'in-progress': 1, done: 2 })
    expect(graph.summary.pages).toEqual({ total: 1, todo: 1, 'in-progress': 0, done: 0 })
  })

  it('refuse un graphe incomplet ou un statut inconnu', () => {
    const entry = (id, schema) => ({
      id,
      schema,
      jsonPath: `dev/components/${id}/${id}.json`,
      twigPath: `dev/__missing__/${id}.twig`
    })

    expect(() => buildDesignSystemGraph({
      components: [entry('card', {
        name: 'Card',
        status: 'ready',
        parts: { action: { component: 'missing-button' } }
      })],
      pages: []
    })).toThrow('references unknown components')

    expect(() => buildDesignSystemGraph({
      components: [entry('card', { name: 'Card', status: 'ready' })],
      pages: []
    })).toThrow('has unsupported status')
  })
})
