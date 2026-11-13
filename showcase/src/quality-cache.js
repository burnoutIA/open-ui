// Derniers résultats de contrôle, gardés dans le navigateur entre deux rechargements.
// Un résultat n'est repris que pour la même entrée, la même empreinte des sources (sourceVersion,
// calculée par le serveur) et le même contexte (props, instances, fond, largeur du canvas) :
// un fichier modifié, une prop changée ou un autre fond relancent les contrôles.

const STORAGE_KEY = 'openui:quality:v1'

function readAll(storage) {
  try {
    return JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

export function contextKey({ props = {}, instances = {}, background = 'light', viewport = 'auto' } = {}) {
  return JSON.stringify({ props, instances, background, viewport })
}

export function loadQualityRecord(entry, context, storage = globalThis.localStorage) {
  const record = readAll(storage)[entry.key]
  if (!record || !entry.sourceVersion) return null
  return record.sourceVersion === entry.sourceVersion && record.context === context ? record.report : null
}

// Seuls les contrôles terminés sont gardés : un contrôle interrompu sera relancé.
export function saveQualityRecord(entry, context, report, storage = globalThis.localStorage) {
  if (!entry.sourceVersion || [report.w3c?.status, report.axe?.status].includes('pending')) return
  const all = readAll(storage)
  all[entry.key] = { sourceVersion: entry.sourceVersion, context, report: { w3c: report.w3c, axe: report.axe } }
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Stockage indisponible (navigation privée, quota) : les contrôles seront simplement relancés.
  }
}
