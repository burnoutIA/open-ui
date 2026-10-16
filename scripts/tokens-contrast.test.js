import fs from 'fs'
import { describe, expect, it } from 'vitest'
import { checkTokenContrast, parseTokens, resolveToken } from './tokens-contrast.js'

describe('tokens-contrast', () => {
  it('résout les références var() en chaîne', () => {
    const tokens = parseTokens(':root { --a: #fff; --b: var(--a); --c: var(--b); }')
    expect(resolveToken(tokens, '--c')).toBe('#fff')
  })

  it('signale une paire insuffisante', () => {
    const results = checkTokenContrast(':root { --color-text: #999999; --color-surface: #ffffff; }')
    const pair = results.find((result) => result.fg === '--color-text' && result.bg === '--color-surface')
    expect(pair.ok).toBe(false)
  })

  for (const kit of ['templates/scss/base/_tokens.scss', 'templates/tailwind/style.css']) {
    it(`toutes les paires du kit ${kit} passent`, () => {
      const results = checkTokenContrast(fs.readFileSync(kit, 'utf8'))
      expect(results.filter((result) => result.skipped)).toEqual([])
      expect(results.filter((result) => !result.ok)).toEqual([])
    })
  }
})
