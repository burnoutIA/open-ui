import { describe, expect, it, vi } from 'vitest'
import { createValidationDocument, normalizeW3cMessages, validateHtmlWithW3c } from './html-validator.js'

describe('Nu HTML Checker adapter', () => {
  it('encapsule un fragment de composant dans un document HTML', () => {
    const document = createValidationDocument('<button type="button">Continuer</button>', 'Button <primaire>')

    expect(document).toContain('<!doctype html>')
    expect(document).toContain('<html lang="fr">')
    expect(document).toContain('<title>Button &lt;primaire&gt;</title>')
    expect(document).toContain('<button type="button">Continuer</button>')
  })

  it('normalise séparément erreurs, avertissements et informations', () => {
    expect(normalizeW3cMessages({ messages: [
      { type: 'error', message: 'Bad value', lastLine: 8 },
      { type: 'info', subType: 'warning', message: 'Consider a heading' },
      { type: 'info', message: 'Trailing slash is unnecessary' }
    ] })).toEqual([
      expect.objectContaining({ type: 'error', message: 'Bad value', lastLine: 8 }),
      expect.objectContaining({ type: 'warning', message: 'Consider a heading' }),
      expect.objectContaining({ type: 'info', message: 'Trailing slash is unnecessary' })
    ])
  })

  it('poste le document au service configuré et résume les résultats', async () => {
    const fetchImplementation = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ type: 'error', message: 'Invalid element' }] })
    })

    const result = await validateHtmlWithW3c('<div>Test</div>', {
      endpoint: 'http://localhost:8888/',
      fetchImplementation
    })

    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.objectContaining({ href: 'http://localhost:8888/?out=json' }),
      expect.objectContaining({ method: 'POST', body: expect.stringContaining('<div>Test</div>') })
    )
    expect(result).toEqual(expect.objectContaining({ external: false, errors: 1, warnings: 0 }))
  })

  it('envoie une page complete sans ajouter un second document HTML', async () => {
    const page = '<!doctype html><html lang="fr"><head><title>Page</title></head><body><main>Test</main></body></html>'
    const fetchImplementation = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [] })
    })

    await validateHtmlWithW3c(page, {
      endpoint: 'http://localhost:8888/',
      fullDocument: true,
      fetchImplementation
    })

    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ body: page })
    )
  })
})
