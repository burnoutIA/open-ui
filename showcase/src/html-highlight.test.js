import { describe, expect, it } from 'vitest'
import { highlightHtml } from './html-highlight.js'

describe('highlightHtml', () => {
  it('colore balises, attributs et valeurs', () => {
    const html = highlightHtml('<button class="btn" type="button">OK</button>')

    expect(html).toContain('<span class="token tag">')
    expect(html).toContain('<span class="token attr-name">class</span>')
    expect(html).toContain('<span class="token attr-value">')
  })

  it('échappe le contenu rendu', () => {
    const html = highlightHtml('<p>a &amp; b <script>alert(1)</script></p>')

    expect(html).not.toMatch(/<script>/)
    expect(html).toContain('&amp;amp;')
  })
})
