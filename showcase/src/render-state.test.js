import { describe, expect, it } from 'vitest'
import { isCurrentRender, normalizeRenderedHtml } from './render-state.js'

describe('render state', () => {
  it('accepte uniquement la révision actuellement attendue', () => {
    expect(isCurrentRender(4, 4)).toBe(true)
    expect(isCurrentRender(3, 4)).toBe(false)
    expect(isCurrentRender(undefined, 4)).toBe(false)
  })

  it('prépare le HTML rendu pour l’affichage et la copie', () => {
    expect(normalizeRenderedHtml('\n<button>Continuer</button>\n')).toBe('<button>Continuer</button>')
    expect(normalizeRenderedHtml(null)).toBe('')
  })
})
