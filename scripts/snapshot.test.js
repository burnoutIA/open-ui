import { describe, expect, it } from 'vitest'
import { buildCases } from './snapshot.js'

describe('buildCases', () => {
  it('part de preview pour chaque cas', () => {
    const cases = buildCases({
      variants: { tone: { type: 'select', default: 'info', options: ['info', 'danger'] } },
      content: { errors: { type: 'array', default: [] } },
      preview: { errors: ['x'] }
    })
    expect(cases).toEqual([
      { label: 'aperçu', props: { errors: ['x'] } },
      { label: 'tone: danger', props: { errors: ['x'], tone: 'danger' } }
    ])
  })
})
