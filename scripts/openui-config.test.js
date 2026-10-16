import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'
import { loadOpenUIConfig } from './openui-config.js'

let root

function workspace(config) {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'openui-config-'))
  if (config) fs.writeFileSync(path.join(root, 'openui.config.json'), JSON.stringify(config))
  return root
}

afterEach(() => {
  if (root) fs.rmSync(root, { recursive: true, force: true })
  root = undefined
})

describe('loadOpenUIConfig', () => {
  it('passe en SCSS sans fichier de configuration', () => {
    const dir = workspace()
    expect(loadOpenUIConfig(dir)).toEqual({
      styling: 'scss',
      styleEntry: path.join(dir, 'dev/assets/scss/style.scss'),
      scriptEntry: path.join(dir, 'dev/assets/js/main.js')
    })
  })

  it('choisit le point d’entrée CSS par défaut en mode Tailwind', () => {
    const dir = workspace({ styling: 'tailwind' })
    expect(loadOpenUIConfig(dir).styleEntry).toBe(path.join(dir, 'dev/assets/css/style.css'))
  })

  it('respecte un styleEntry explicite, avec ou sans slash initial', () => {
    const dir = workspace({ styling: 'scss', styleEntry: '/src/styles/main.scss' })
    expect(loadOpenUIConfig(dir).styleEntry).toBe(path.join(dir, 'src/styles/main.scss'))
  })

  it('refuse un mode inconnu', () => {
    const dir = workspace({ styling: 'less' })
    expect(() => loadOpenUIConfig(dir)).toThrow(/"styling"/)
  })
})
