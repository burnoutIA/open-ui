import { describe, expect, it } from 'vitest'
import { countAxeNodes, normalizeAxeResults, summarizeQualityReport } from './quality-state.js'

describe('quality report summary', () => {
  it('compte les éléments concernés par les règles Axe', () => {
    expect(countAxeNodes([{ nodes: [{}, {}] }, { nodes: [{}] }])).toBe(3)
  })

  it('réduit les résultats Axe aux données sérialisables affichées', () => {
    expect(normalizeAxeResults([{
      id: 'button-name',
      impact: 'critical',
      help: 'Buttons must have discernible text',
      description: 'Ensures buttons have discernible text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/button-name',
      nodes: [{ html: '<button></button>', target: ['button'], failureSummary: null }]
    }])).toEqual([expect.objectContaining({
      id: 'button-name',
      impact: 'critical',
      nodes: [{ html: '<button></button>', target: ['button'], failureSummary: '' }]
    })])
  })

  it('ne présente jamais un contrôle automatique comme une conformité RGAA', () => {
    const summary = summarizeQualityReport({
      w3c: { status: 'done', result: { errors: 0, warnings: 0 } },
      axe: { status: 'done', result: { violations: [], incomplete: [] } }
    })

    expect(summary).toEqual({
      status: 'pass',
      label: 'Aucune erreur automatique détectée',
      catalogLabel: 'Auto OK'
    })
    expect(summary.label).not.toContain('RGAA')
  })

  it('priorise les erreurs puis les vérifications manuelles', () => {
    expect(summarizeQualityReport({
      w3c: { status: 'done', result: { errors: 1, warnings: 0 } },
      axe: { status: 'done', result: { violations: [{ nodes: [{}, {}] }], incomplete: [] } }
    })).toEqual(expect.objectContaining({ status: 'fail', catalogLabel: '3' }))

    expect(summarizeQualityReport({
      w3c: { status: 'done', result: { errors: 0, warnings: 1 } },
      axe: { status: 'done', result: { violations: [], incomplete: [] } }
    })).toEqual(expect.objectContaining({ status: 'review' }))

    expect(summarizeQualityReport({
      w3c: { status: 'idle' },
      axe: { status: 'done', result: { violations: [], incomplete: [] } }
    })).toEqual(expect.objectContaining({
      status: 'review',
      label: 'Contrôle automatique partiel'
    }))
  })
})
