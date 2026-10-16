import path from 'path'
import { describe, expect, it } from 'vitest'
import { createProjectStylesheetSource, EMPTY_PROJECT_STYLESHEET } from './project-style.js'

describe('project stylesheet', () => {
  it('fournit une feuille vide quand le workspace ne contient pas encore de SCSS', () => {
    const missingStylesheet = path.join(process.cwd(), 'dev/__openui_missing__/style.scss')

    expect(createProjectStylesheetSource(missingStylesheet)).toBe(EMPTY_PROJECT_STYLESHEET)
  })
})
