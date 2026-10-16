import claude from './claude.js'
import codex from './codex.js'
import copilot from './copilot.js'
import opencode from './opencode.js'
import pi from './pi.js'

const adapters = new Map(
  [codex, copilot, claude, opencode, pi].map((adapter) => [adapter.name, adapter]),
)

export function getAdapter(name) {
  const adapter = adapters.get(name)

  if (!adapter) {
    throw new Error(
      `Harnais inconnu "${name}". Valeurs disponibles : ${[...adapters.keys()].join(', ')}.`,
    )
  }

  return adapter
}

export function listAdapters() {
  return [...adapters.keys()]
}
