import { describe, expect, it } from 'vitest'
import { ENDLESS_WORD, lorem, stressSteps } from './stress.js'

describe('stress du contenu', () => {
  it('produit un texte latin déterministe du nombre de mots demandé', () => {
    expect(lorem(3)).toBe('Lorem ipsum dolor')
    expect(lorem(192).split(' ')).toHaveLength(192)
    expect(lorem(6)).toMatch(/\.$/)
    expect(lorem(24)).toBe(lorem(24))
  })

  it('enchaîne les paliers texte jusqu’au mot interminable puis au vide', () => {
    const steps = stressSteps({ type: 'text' })
    expect(steps.map((step) => step.label)).toEqual(['3 mots', '6 mots', '12 mots', '24 mots', '48 mots', '96 mots', '192 mots', 'mot interminable', 'vide'])
    expect(steps.at(-2).value()).toBe(ENDLESS_WORD)
    expect(steps.at(-1).value()).toBe('')
  })

  it('respecte les bornes d’un nombre', () => {
    const values = stressSteps({ type: 'number', min: 0, max: 100 }).map((step) => step.value())
    expect(values).toEqual([0, 1, 99])
  })

  it('répète les éléments d’une liste, ou en fabrique un', () => {
    const [empty, one, five] = stressSteps({ type: 'array' })
    const links = [{ text: 'A' }, { text: 'B' }]
    expect(empty.value(links)).toEqual([])
    expect(five.value(links).map((item) => item.text)).toEqual(['A', 'B', 'A', 'B', 'A'])
    expect(one.value([], () => ({ text: 'Nouveau' }))).toEqual([{ text: 'Nouveau' }])
  })

  it('passe une image par chaque format, en gardant son texte alternatif', () => {
    const steps = stressSteps({ type: 'image' })
    expect(steps.map((step) => step.label)).toEqual(['paysage', 'portrait', 'carré', 'panoramique', 'minuscule', 'absente'])
    expect(steps[1].value({ src: '/x.jpg', alt: 'Atelier' })).toEqual({ src: '/__openui/fake-image/900x1600.svg', alt: 'Atelier' })
    expect(steps.at(-1).value({ src: '/x.jpg', alt: '' })).toEqual({ src: '', alt: '' })
  })

  it('ignore une prop marquée stress: false', () => {
    expect(stressSteps({ type: 'text', stress: false })).toEqual([])
  })

  it('ne stresse ni les select ni les cases à cocher', () => {
    expect(stressSteps({ type: 'select' })).toEqual([])
    expect(stressSteps({ type: 'checkbox' })).toEqual([])
  })
})
