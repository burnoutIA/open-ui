import { describe, expect, it } from 'vitest'
import { fakeImageUrl, parseFakeImageUrl, ratioLabel, renderFakeImage } from './fake-image.js'

describe('images d’exemple', () => {
  it('construit et relit une URL', () => {
    const url = fakeImageUrl(1600, 900, 'Atelier & co')
    expect(url).toBe('/__openui/fake-image/1600x900.svg?label=Atelier%20%26%20co')
    expect(parseFakeImageUrl(url)).toEqual({ width: 1600, height: 900, label: 'Atelier & co' })
  })

  it('encode l’apostrophe et les parenthèses du libellé', () => {
    const url = fakeImageUrl(1600, 900, "Rénovation d'un atelier (2026)")
    expect(url).not.toMatch(/['()]/)
    expect(parseFakeImageUrl(url).label).toBe("Rénovation d'un atelier (2026)")
  })

  it('refuse une taille invalide ou démesurée', () => {
    expect(parseFakeImageUrl('/__openui/fake-image/0x900.svg')).toBeNull()
    expect(parseFakeImageUrl('/__openui/fake-image/9000x900.svg')).toBeNull()
    expect(parseFakeImageUrl('/autre/1600x900.svg')).toBeNull()
  })

  it('affiche un ratio lisible', () => {
    expect(ratioLabel(1600, 900)).toBe('16:9')
    expect(ratioLabel(2400, 600)).toBe('4:1')
    expect(ratioLabel(1000, 333)).toBe('3.00:1')
  })

  it('dessine une mire SVG avec sa taille, son ratio et un libellé échappé', () => {
    const svg = renderFakeImage(900, 1600, '<b>')
    expect(svg).toMatch(/^<svg [^>]*width="900" height="1600"/)
    expect(svg).toContain('900 × 1600')
    expect(svg).toContain('9:16')
    expect(svg).toContain('&lt;b&gt;')
  })
})
