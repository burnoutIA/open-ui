import { createHash } from 'node:crypto'
import { access, mkdir, readFile, readdir, rm, rmdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const STANDARD_SKILL_FIELDS = new Set([
  'name',
  'description',
  'license',
  'compatibility',
  'metadata',
  'allowed-tools',
  'disable-model-invocation',
  'user-invocable',
])

function normalizeText(value) {
  return value.replace(/\r\n/g, '\n')
}

function normalizeMarkdown(value) {
  return `${normalizeText(value).trimEnd()}\n`
}

function normalizeRelative(value) {
  return value.split(path.sep).join('/')
}

function yamlString(value) {
  return JSON.stringify(value)
}

export function splitFrontmatter(content, label = 'fichier') {
  const normalized = normalizeText(content)

  if (!normalized.startsWith('---\n')) {
    throw new Error(`${label} doit commencer par un frontmatter YAML.`)
  }

  const end = normalized.indexOf('\n---\n', 4)

  if (end === -1) {
    throw new Error(`Frontmatter YAML non ferme dans ${label}.`)
  }

  return {
    frontmatter: normalized.slice(4, end),
    body: normalized.slice(end + 5).replace(/^\n+/, ''),
  }
}

function getFrontmatterValue(frontmatter, key, label) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))

  if (!match) {
    throw new Error(`Champ ${key} manquant dans ${label}.`)
  }

  return match[1].trim().replace(/^['"]|['"]$/g, '')
}

export function keepStandardSkillFrontmatter(content, label) {
  const { frontmatter, body } = splitFrontmatter(content, label)
  const lines = frontmatter.split('\n')
  const kept = []
  let keepCurrent = false

  for (const line of lines) {
    const topLevel = line.match(/^([a-zA-Z0-9_-]+):(?:\s|$)/)

    if (topLevel) {
      keepCurrent = STANDARD_SKILL_FIELDS.has(topLevel[1])
    }

    if (keepCurrent) {
      kept.push(line)
    }
  }

  const cleaned = `---\n${kept.join('\n').trim()}\n---\n\n${body.trimEnd()}\n`
  const cleanedFrontmatter = splitFrontmatter(cleaned, label).frontmatter
  getFrontmatterValue(cleanedFrontmatter, 'name', label)

  if (!/^description:/m.test(cleanedFrontmatter)) {
    throw new Error(`Champ description manquant dans ${label}.`)
  }

  return cleaned
}

function parseCommand(content, name) {
  const { frontmatter, body } = splitFrontmatter(content, `commande ${name}`)

  return {
    name,
    description: getFrontmatterValue(frontmatter, 'description', `commande ${name}`),
    argumentHint: frontmatter.match(/^argument-hint:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, ''),
    source: normalizeMarkdown(content),
    body: body.trim(),
  }
}

async function exists(target) {
  try {
    await access(target)
    return true
  } catch {
    return false
  }
}

async function listFiles(root) {
  if (!(await exists(root))) {
    return []
  }

  const output = []

  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name))

    for (const entry of entries) {
      const absolute = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        await visit(absolute)
      } else if (entry.isFile()) {
        output.push(absolute)
      }
    }
  }

  await visit(root)
  return output
}

async function copyTreeToMap(sourceRoot, outputRoot, files) {
  for (const absolute of await listFiles(sourceRoot)) {
    const relative = normalizeRelative(path.relative(sourceRoot, absolute))

    if (relative === 'SKILL.md') {
      continue
    }

    files.set(normalizeRelative(path.posix.join(outputRoot, relative)), await readFile(absolute))
  }
}

function renderCommandSkill(command, options = {}) {
  const frontmatter = [
    '---',
    `name: ${command.name}`,
    `description: ${yamlString(command.description)}`,
  ]

  if (command.argumentHint && options.includeArgumentHint !== false) {
    frontmatter.push(`argument-hint: ${yamlString(command.argumentHint)}`)
  }

  if (options.disableModelInvocation) {
    frontmatter.push('disable-model-invocation: true')
  }

  frontmatter.push('---')

  const argumentsBlock = options.includeArgumentsPlaceholder === false
    ? ''
    : '\n\n## Entree utilisateur\n\n$ARGUMENTS'

  return `${frontmatter.join('\n')}\n\n${command.body}${argumentsBlock}\n`
}

function renderPromptCommand(command) {
  const { frontmatter } = splitFrontmatter(command.source, `commande ${command.name}`)
  return `---\n${frontmatter.trim()}\n---\n\n${command.body}\n\n## Entree utilisateur\n\n$ARGUMENTS\n`
}

function renderOpenAiInterface(configuration) {
  return [
    'interface:',
    `  display_name: ${yamlString(configuration.displayName)}`,
    `  short_description: ${yamlString(configuration.shortDescription)}`,
    `  default_prompt: ${yamlString(configuration.defaultPrompt)}`,
    '',
  ].join('\n')
}

export async function loadProject(root) {
  const sourceRoot = path.join(root, 'skill-src')
  const manifestPath = path.join(sourceRoot, 'manifest.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

  if (manifest.version !== 1 || !Array.isArray(manifest.skills) || !Array.isArray(manifest.commandGroups)) {
    throw new Error('skill-src/manifest.json est invalide ou utilise une version non supportee.')
  }

  const skills = new Map()

  for (const definition of manifest.skills) {
    const directory = path.join(sourceRoot, 'skills', definition.name)
    const skillPath = path.join(directory, 'SKILL.md')
    const content = await readFile(skillPath, 'utf8')
    const { frontmatter } = splitFrontmatter(content, `skill ${definition.name}`)
    const declaredName = getFrontmatterValue(frontmatter, 'name', `skill ${definition.name}`)

    if (declaredName !== definition.name) {
      throw new Error(`Le skill ${definition.name} declare le nom ${declaredName}.`)
    }

    if (!/^description:/m.test(frontmatter)) {
      throw new Error(`Le skill ${definition.name} ne declare pas de description.`)
    }

    skills.set(definition.name, {
      ...definition,
      directory,
      content: normalizeText(content).trimEnd() + '\n',
    })
  }

  const commands = new Map()

  for (const group of manifest.commandGroups) {
    if (!skills.has(group.hostSkill)) {
      throw new Error(`Le host skill ${group.hostSkill} est inconnu.`)
    }

    for (const name of group.commands) {
      if (commands.has(name)) {
        throw new Error(`La commande ${name} est declaree plusieurs fois.`)
      }

      const commandPath = path.join(sourceRoot, 'commands', `${name}.md`)
      commands.set(name, parseCommand(await readFile(commandPath, 'utf8'), name))
    }
  }

  const commandSkillEntrypoints = manifest.commandSkillEntrypoints ?? [...commands.keys()]

  if (!Array.isArray(commandSkillEntrypoints)) {
    throw new Error('commandSkillEntrypoints doit etre une liste de commandes.')
  }

  const uniqueCommandSkillEntrypoints = new Set()

  for (const name of commandSkillEntrypoints) {
    if (!commands.has(name)) {
      throw new Error(`La commande exposee comme skill ${name} est inconnue.`)
    }

    if (uniqueCommandSkillEntrypoints.has(name)) {
      throw new Error(`La commande exposee comme skill ${name} est declaree plusieurs fois.`)
    }

    uniqueCommandSkillEntrypoints.add(name)
  }

  return {
    root,
    sourceRoot,
    manifest,
    skills,
    commands,
    commandSkillEntrypoints: uniqueCommandSkillEntrypoints,
  }
}

export async function buildExpected(project, adapter) {
  const files = new Map()

  for (const [name, skill] of project.skills) {
    const targetRoot = normalizeRelative(path.posix.join(adapter.skillRoot, name))

    files.set(`${targetRoot}/SKILL.md`, Buffer.from(skill.content, 'utf8'))
    await copyTreeToMap(skill.directory, targetRoot, files)

    if (adapter.includeOpenAiInterface && skill.interface) {
      files.set(
        `${targetRoot}/agents/openai.yaml`,
        Buffer.from(renderOpenAiInterface(skill.interface), 'utf8'),
      )
    }
  }

  if (adapter.commandMode === 'skill') {
    const commandSkillEntrypoints = [...project.commands.values()].filter((command) => (
      project.commandSkillEntrypoints.has(command.name)
    ))

    for (const command of commandSkillEntrypoints) {
      files.set(
        normalizeRelative(path.posix.join(adapter.skillRoot, command.name, 'SKILL.md')),
        Buffer.from(renderCommandSkill(command, adapter.commandSkillOptions), 'utf8'),
      )
    }
  } else if (adapter.commandMode === 'prompt') {
    for (const command of project.commands.values()) {
      files.set(
        normalizeRelative(path.posix.join(adapter.commandRoot, `${command.name}.md`)),
        Buffer.from(renderPromptCommand(command), 'utf8'),
      )
    }
  } else {
    throw new Error(`Mode de commandes non supporte : ${adapter.commandMode}.`)
  }

  return files
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

function lockPath(root, target) {
  return path.join(root, '.skill-harness', `${target}.lock.json`)
}

async function readLock(root, target) {
  const targetPath = lockPath(root, target)

  if (!(await exists(targetPath))) {
    return null
  }

  return JSON.parse(await readFile(targetPath, 'utf8'))
}

function resolveInside(root, relative) {
  const absoluteRoot = path.resolve(root)
  const absolute = path.resolve(root, relative)

  if (absolute !== absoluteRoot && !absolute.startsWith(`${absoluteRoot}${path.sep}`)) {
    throw new Error(`Chemin genere hors workspace refuse : ${relative}`)
  }

  return absolute
}

async function removeEmptyParents(root, absoluteFile) {
  const absoluteRoot = path.resolve(root)
  let directory = path.dirname(absoluteFile)

  while (directory !== absoluteRoot && directory.startsWith(`${absoluteRoot}${path.sep}`)) {
    try {
      if ((await readdir(directory)).length > 0) {
        return
      }

      await rmdir(directory)
      directory = path.dirname(directory)
    } catch (error) {
      if (error.code === 'ENOENT') {
        directory = path.dirname(directory)
        continue
      }

      if (error.code === 'ENOTEMPTY') {
        return
      }

      throw error
    }
  }
}

async function currentHash(absolute) {
  if (!(await exists(absolute))) {
    return null
  }

  const information = await stat(absolute)
  return information.isFile() ? hash(await readFile(absolute)) : null
}

export async function syncTarget(project, adapter, expected, { force = false } = {}) {
  const previous = await readLock(project.root, adapter.name)
  const expectedHashes = Object.fromEntries(
    [...expected.entries()].map(([relative, content]) => [relative, hash(content)]),
  )
  const protectedChanges = []

  for (const [relative, expectedHash] of Object.entries(expectedHashes)) {
    const absolute = resolveInside(project.root, relative)
    const actualHash = await currentHash(absolute)
    const previousHash = previous?.files?.[relative]

    if (actualHash && actualHash !== expectedHash && (!previousHash || actualHash !== previousHash)) {
      protectedChanges.push(relative)
    }
  }

  for (const relative of Object.keys(previous?.files ?? {})) {
    if (expectedHashes[relative]) {
      continue
    }

    const absolute = resolveInside(project.root, relative)
    const actualHash = await currentHash(absolute)

    if (actualHash && actualHash !== previous.files[relative]) {
      protectedChanges.push(relative)
    }
  }

  if (protectedChanges.length && !force) {
    throw new Error(
      `Sorties modifiees hors generateur :\n- ${protectedChanges.join('\n- ')}\nRelancer avec --force apres verification.`,
    )
  }

  const summary = { added: 0, updated: 0, unchanged: 0, removed: 0 }

  for (const [relative, content] of expected) {
    const absolute = resolveInside(project.root, relative)
    const actualHash = await currentHash(absolute)
    const expectedHash = expectedHashes[relative]

    if (actualHash === expectedHash) {
      summary.unchanged += 1
      continue
    }

    await mkdir(path.dirname(absolute), { recursive: true })
    await writeFile(absolute, content)
    summary[actualHash ? 'updated' : 'added'] += 1
  }

  for (const relative of Object.keys(previous?.files ?? {})) {
    if (expectedHashes[relative]) {
      continue
    }

    const absolute = resolveInside(project.root, relative)

    if (await exists(absolute)) {
      await rm(absolute)
      await removeEmptyParents(project.root, absolute)
      summary.removed += 1
    }
  }

  const serialized = `${JSON.stringify({ version: 1, target: adapter.name, files: expectedHashes }, null, 2)}\n`
  await mkdir(path.dirname(lockPath(project.root, adapter.name)), { recursive: true })
  await writeFile(lockPath(project.root, adapter.name), serialized, 'utf8')

  return summary
}

export async function checkTarget(project, adapter, expected) {
  const previous = await readLock(project.root, adapter.name)
  const issues = []

  for (const [relative, content] of expected) {
    const expectedHash = hash(content)
    const actualHash = await currentHash(resolveInside(project.root, relative))

    if (!actualHash) {
      issues.push({ type: 'missing', path: relative })
    } else if (actualHash !== expectedHash) {
      issues.push({ type: 'different', path: relative })
    }
  }

  for (const relative of Object.keys(previous?.files ?? {})) {
    if (!expected.has(relative) && (await exists(resolveInside(project.root, relative)))) {
      issues.push({ type: 'stale', path: relative })
    }
  }

  return issues
}

export async function importCodexSource(root, manifest, { force = false } = {}) {
  const sourceRoot = path.join(root, 'skill-src')
  const skillsRoot = path.join(sourceRoot, 'skills')
  const commandsRoot = path.join(sourceRoot, 'commands')

  if ((await exists(skillsRoot)) && !force) {
    throw new Error('skill-src/skills existe deja. Utiliser --force seulement pour une migration explicite.')
  }

  await mkdir(skillsRoot, { recursive: true })
  await mkdir(commandsRoot, { recursive: true })

  for (const skill of manifest.skills) {
    const source = path.join(root, '.agents', 'skills', skill.name)
    const target = path.join(skillsRoot, skill.name)

    if (!(await exists(path.join(source, 'SKILL.md')))) {
      throw new Error(`Skill Codex introuvable : ${skill.name}.`)
    }

    for (const absolute of await listFiles(source)) {
      const relative = normalizeRelative(path.relative(source, absolute))

      if (relative.startsWith('core/') || relative.startsWith('agents/')) {
        continue
      }

      const destination = path.join(target, relative)
      await mkdir(path.dirname(destination), { recursive: true })

      if (relative === 'SKILL.md') {
        const cleaned = keepStandardSkillFrontmatter(await readFile(absolute, 'utf8'), `skill ${skill.name}`)
        await writeFile(destination, cleaned, 'utf8')
      } else {
        await writeFile(destination, await readFile(absolute))
      }
    }
  }

  for (const group of manifest.commandGroups) {
    for (const command of group.commands) {
      const source = path.join(root, '.agents', 'skills', group.hostSkill, 'core', `${command}.md`)

      if (!(await exists(source))) {
        throw new Error(`Commande Codex introuvable : ${command}.`)
      }

      await writeFile(path.join(commandsRoot, `${command}.md`), normalizeMarkdown(await readFile(source, 'utf8')), 'utf8')
    }
  }

  return {
    skills: manifest.skills.length,
    commands: manifest.commandGroups.reduce((total, group) => total + group.commands.length, 0),
  }
}
