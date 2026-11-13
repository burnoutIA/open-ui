import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterAll, describe, expect, it } from 'vitest'
import { parseTokenDeclarations, readProjectTokens, renderTokensPage, tokensCatalogEntry } from './tokens.js'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'openui-tokens-'))
afterAll(() => fs.rmSync(root, { recursive: true, force: true }))

function workspace(styling, files) {
  const dir = fs.mkdtempSync(path.join(root, `${styling}-`))
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
    fs.writeFileSync(path.join(dir, file), content)
  }
  const tokensFile = styling === 'scss' ? path.join(dir, 'dev/assets/scss/base/_tokens.scss') : path.join(dir, 'dev/assets/css/style.css')
  return { dir, config: { styling, tokensFile } }
}

describe('page des tokens', () => {
  it('lit les déclarations dans l’ordre, sans les commentaires, première occurrence gagnante', () => {
    const tokens = parseTokenDeclarations(':root {\n  // --old: 1;\n  /* --x: 2; */\n  --a: #fff;\n  --b: var(--a);\n  @media (width > 1px) { --a: #000; }\n}')
    expect([...tokens]).toEqual([['--a', '#fff'], ['--b', 'var(--a)']])
  })

  it('classe palette, rôles et échelles, et vérifie les contrastes', () => {
    const { dir, config } = workspace('scss', {
      'dev/assets/scss/base/_tokens.scss': ':root { --color-white: #ffffff; --color-gray-900: #111827; --color-text: var(--color-gray-900); --color-surface: var(--color-white); --spacing-md: 1rem; --z-modal: 1050; }',
      'dev/assets/scss/base/_breakpoints.scss': "$breakpoints: (\n  'sm': 40rem,\n  'md': 48rem\n);"
    })
    const tokens = readProjectTokens(config, dir)
    const byId = Object.fromEntries(tokens.groups.map((group) => [group.id, group.tokens.map((token) => token.name)]))
    expect(byId).toEqual({
      palette: ['--color-white', '--color-gray-900'],
      roles: ['--color-text', '--color-surface'],
      spacing: ['--spacing-md'],
      z: ['--z-modal']
    })
    expect(tokens.groups[1].tokens[0].resolved).toBe('#111827')
    expect(tokens.contrast).toEqual([expect.objectContaining({ fg: '--color-text', bg: '--color-surface', ok: true })])
    expect(tokens.breakpoints).toEqual([{ name: 'sm', value: '40rem' }, { name: 'md', value: '48rem' }])
    expect(renderTokensPage(tokens)).toContain('data-copy-token="var(--color-text)"')
  })

  it('n’ajoute l’entrée au catalogue que si le fichier de tokens existe', () => {
    expect(tokensCatalogEntry(workspace('tailwind', {}).config)).toBeNull()
    expect(tokensCatalogEntry(workspace('tailwind', { 'dev/assets/css/style.css': '@theme { --color-a: #fff; }' }).config)).toMatchObject({ type: 'tokens', level: 'foundation' })
  })
})
