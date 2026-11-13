import { describe, expect, it } from 'vitest'
import { contextKey, loadQualityRecord, saveQualityRecord } from './quality-cache.js'

function memoryStorage() {
  const data = new Map()
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}

const done = { w3c: { status: 'idle' }, axe: { status: 'done', result: { violations: [] } } }

describe('cache des contrôles', () => {
  it('reprend un résultat pour la même empreinte et le même contexte', () => {
    const storage = memoryStorage()
    const entry = { key: 'component:button', sourceVersion: 'abc' }
    saveQualityRecord(entry, contextKey(), done, storage)
    expect(loadQualityRecord(entry, contextKey(), storage)).toEqual(done)
  })

  it('relance après une modification de fichier ou un autre contexte', () => {
    const storage = memoryStorage()
    saveQualityRecord({ key: 'component:button', sourceVersion: 'abc' }, contextKey(), done, storage)
    expect(loadQualityRecord({ key: 'component:button', sourceVersion: 'def' }, contextKey(), storage)).toBeNull()
    expect(loadQualityRecord({ key: 'component:button', sourceVersion: 'abc' }, contextKey({ background: 'dark' }), storage)).toBeNull()
  })

  it('ne garde pas un contrôle en cours', () => {
    const storage = memoryStorage()
    const entry = { key: 'page:contact', sourceVersion: 'abc' }
    saveQualityRecord(entry, contextKey(), { w3c: { status: 'pending' }, axe: { status: 'done' } }, storage)
    expect(loadQualityRecord(entry, contextKey(), storage)).toBeNull()
  })
})
