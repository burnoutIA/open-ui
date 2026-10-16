import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { getAdapter, listAdapters } from './skill-harness/adapters/index.js'
import { buildExpected, checkTarget, importCodexSource, loadProject, syncTarget } from './skill-harness/core.js'

function usage() {
  return `Usage:
  node scripts/skill-harness.js import --from codex
  node scripts/skill-harness.js build --target <${listAdapters().join('|')}> [--force]
  node scripts/skill-harness.js check --target <${listAdapters().join('|')}>
  node scripts/skill-harness.js list
`
}

function parseArguments(argv) {
  const [command, ...rest] = argv
  const options = { command, force: false }

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index]

    if (value === '--force') {
      options.force = true
    } else if (value === '--target' || value === '--from') {
      options[value.slice(2)] = rest[index + 1]
      index += 1
    } else {
      throw new Error(`Argument inconnu : ${value}`)
    }
  }

  return options
}

async function main() {
  const root = process.cwd()
  const options = parseArguments(process.argv.slice(2))

  if (options.command === 'list') {
    console.log(listAdapters().join('\n'))
    return
  }

  if (options.command === 'import') {
    if (options.from !== 'codex') {
      throw new Error('La migration initiale supporte uniquement --from codex.')
    }

    const manifest = JSON.parse(await readFile(path.join(root, 'skill-src', 'manifest.json'), 'utf8'))
    const summary = await importCodexSource(root, manifest, { force: options.force })
    console.log(`Sources importees : ${summary.skills} skills, ${summary.commands} commandes.`)
    return
  }

  if (options.command !== 'build' && options.command !== 'check') {
    throw new Error(usage())
  }

  if (!options.target) {
    throw new Error(`--target est obligatoire.\n${usage()}`)
  }

  const adapter = getAdapter(options.target)
  const project = await loadProject(root)
  const expected = await buildExpected(project, adapter)

  if (options.command === 'check') {
    const issues = await checkTarget(project, adapter, expected)

    if (issues.length) {
      for (const issue of issues) {
        console.error(`${issue.type}: ${issue.path}`)
      }

      process.exitCode = 1
      return
    }

    console.log(`Cible ${adapter.name} a jour : ${expected.size} fichiers.`)
    return
  }

  const summary = await syncTarget(project, adapter, expected, { force: options.force })
  console.log(
    `Cible ${adapter.name} generee : ${summary.added} ajoutes, ${summary.updated} mis a jour, ${summary.unchanged} inchanges, ${summary.removed} supprimes.`,
  )
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
