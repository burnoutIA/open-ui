import path from 'path'
import * as sass from 'sass'
import { describe, expect, it } from 'vitest'

describe('kit SCSS', () => {
  const css = sass.compile(path.join('templates/scss/style.scss')).css

  it('compile et expose les tokens sur :root', () => {
    expect(css).toMatch(/:root\s*{[^}]*--color-primary:/)
  })

  // Les classes responsives ne fixent que la fin : un début en raccourci `span 12` les neutraliserait.
  it('laisse le début des items de grille libre', () => {
    expect(css).toMatch(/\.grid__item\s*{[^}]*grid-column-end: span 12/)
    expect(css).not.toMatch(/\.grid__item[^{]*{[^}]*grid-column: span/)
    expect(css).toMatch(/\.grid__item--md-span-6\s*{\s*grid-column-end: span 6/)
  })

  it('charge les polices depuis le dossier fonts voisin du point d’entrée', () => {
    expect(css).toContain("url(\"../fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2\")")
  })
})
