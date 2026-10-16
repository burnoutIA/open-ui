import { access, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getAdapter, listAdapters } from './skill-harness/adapters/index.js'
import { buildExpected, loadProject, syncTarget } from './skill-harness/core.js'

describe('skill harness', () => {
  it('expose les cinq harnais sans en choisir implicitement un', () => {
    expect(listAdapters()).toEqual(['codex', 'copilot', 'claude', 'opencode', 'pi'])
  })

  it('genere les chemins Codex sans sortie pour un autre harnais', async () => {
    const project = await loadProject(process.cwd())
    const files = await buildExpected(project, getAdapter('codex'))
    const skillDefinitions = [...files.keys()].filter((file) => (
      /^\.agents\/skills\/[^/]+\/SKILL\.md$/.test(file)
    ))

    expect(files.has('.agents/skills/figma-to-open-ui/SKILL.md')).toBe(true)
    expect(files.has('.agents/skills/open-ui-analyze-figma/SKILL.md')).toBe(true)
    expect(files.has('.agents/skills/open-ui-implement-figma/SKILL.md')).toBe(true)
    expect(files.has('.agents/skills/open-ui-check/SKILL.md')).toBe(true)
    expect(files.has('.agents/skills/open-ui-map/SKILL.md')).toBe(false)
    expect(files.has('.agents/skills/rgaa-check-page/SKILL.md')).toBe(false)
    expect(skillDefinitions).toHaveLength(12)
    expect(files.get('.agents/skills/open-ui-analyze-figma/SKILL.md').toString('utf8')).not.toContain('$ARGUMENTS')
    expect([...files.keys()].some((file) => file.startsWith('.github/'))).toBe(false)
    expect([...files.keys()].some((file) => file.startsWith('.opencode/'))).toBe(false)
    expect([...files.keys()].some((file) => file.startsWith('.pi/'))).toBe(false)
  })

  it('adapte les commandes Copilot en skills explicitement invocables', async () => {
    const project = await loadProject(process.cwd())
    const files = await buildExpected(project, getAdapter('copilot'))
    const command = files.get('.github/skills/open-ui-analyze-figma/SKILL.md').toString('utf8')

    expect(files.has('.github/skills/figma-to-open-ui/SKILL.md')).toBe(true)
    expect(files.has('.github/skills/open-ui-map/SKILL.md')).toBe(false)
    expect(command).toContain('disable-model-invocation: true')
    expect(command).toContain('$ARGUMENTS')
  })

  it('adapte les commandes OpenCode et Pi dans leurs repertoires natifs', async () => {
    const project = await loadProject(process.cwd())
    const openCode = await buildExpected(project, getAdapter('opencode'))
    const pi = await buildExpected(project, getAdapter('pi'))

    expect(openCode.has('.opencode/commands/open-ui-analyze-figma.md')).toBe(true)
    expect(openCode.has('.opencode/commands/open-ui-map.md')).toBe(true)
    expect(openCode.has('.opencode/commands/rgaa-check-page.md')).toBe(true)
    expect(pi.has('.pi/prompts/open-ui-analyze-figma.md')).toBe(true)
    expect(pi.has('.pi/prompts/open-ui-map.md')).toBe(true)
  })

  it('retire les anciens wrappers et leurs dossiers devenus vides', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'openui-skill-harness-cleanup-'))

    try {
      const sourceProject = await loadProject(process.cwd())
      const project = { ...sourceProject, root: directory }
      const legacyProject = {
        ...project,
        commandSkillEntrypoints: new Set(project.commands.keys()),
      }
      const adapter = getAdapter('codex')
      const legacyFiles = await buildExpected(legacyProject, adapter)
      const expected = await buildExpected(project, adapter)

      await syncTarget(project, adapter, legacyFiles)
      const summary = await syncTarget(project, adapter, expected)

      expect(summary.removed).toBe(project.commands.size - project.commandSkillEntrypoints.size)
      await expect(access(path.join(directory, '.agents/skills/open-ui-map'))).rejects.toThrow()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('reste idempotent et refuse d ecraser une sortie modifiee a la main', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'openui-skill-harness-'))

    try {
      const sourceProject = await loadProject(process.cwd())
      const project = { ...sourceProject, root: directory }
      const adapter = getAdapter('codex')
      const files = await buildExpected(project, adapter)
      const first = await syncTarget(project, adapter, files)
      const second = await syncTarget(project, adapter, files)

      expect(first.added).toBe(files.size)
      expect(second).toEqual({ added: 0, updated: 0, unchanged: files.size, removed: 0 })

      await writeFile(
        path.join(directory, '.agents/skills/figma-to-open-ui/SKILL.md'),
        'modification manuelle',
        'utf8',
      )

      await expect(syncTarget(project, adapter, files)).rejects.toThrow(
        'Sorties modifiees hors generateur',
      )
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
