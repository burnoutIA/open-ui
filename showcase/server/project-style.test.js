import fs from 'fs'
import os from 'os'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { createProjectStylesheetSource, EMPTY_PROJECT_STYLESHEET } from './project-style.js'

describe('project stylesheet', () => {
  it('fournit une feuille vide quand le workspace ne contient pas encore de styles', () => {
    const missingStylesheet = path.join(process.cwd(), 'dev/__openui_missing__/style.scss')

    expect(createProjectStylesheetSource(missingStylesheet)).toBe(EMPTY_PROJECT_STYLESHEET)
  })

  it('charge la feuille avec @use en SCSS et @import en Tailwind', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openui-style-'))
    const stylesheet = path.join(dir, 'style.css')
    fs.writeFileSync(stylesheet, '')

    try {
      expect(createProjectStylesheetSource(stylesheet)).toMatch(/^@use "/)
      expect(createProjectStylesheetSource(stylesheet, 'tailwind')).toMatch(/^@import "/)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})
