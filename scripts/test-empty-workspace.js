#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

const root = process.cwd()
const fixture = fs.mkdtempSync(path.join(root, '.openui-empty-'))
const viteBin = path.join(root, 'node_modules/vite/bin/vite.js')

try {
  fs.copyFileSync(path.join(root, 'package.json'), path.join(fixture, 'package.json'))
  fs.copyFileSync(path.join(root, 'vite.config.js'), path.join(fixture, 'vite.config.js'))
  fs.cpSync(path.join(root, 'showcase'), path.join(fixture, 'showcase'), { recursive: true })
  fs.mkdirSync(path.join(fixture, 'scripts'))
  fs.copyFileSync(
    path.join(root, 'scripts/design-system.js'),
    path.join(fixture, 'scripts/design-system.js')
  )

  const result = spawnSync(process.execPath, [viteBin, 'build'], {
    cwd: fixture,
    stdio: 'inherit'
  })

  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`Empty workspace build failed with exit code ${result.status}.`)

  const expectedOutputs = [
    path.join(fixture, 'public/index.html'),
    path.join(fixture, 'public/showcase/index.html'),
    path.join(fixture, 'public/showcase/preview.html')
  ]

  for (const output of expectedOutputs) {
    if (!fs.existsSync(output)) throw new Error(`Missing empty workspace output: ${output}`)
  }

  console.log('Empty workspace valid: build succeeded without dev/ or public/.')
} finally {
  fs.rmSync(fixture, { recursive: true, force: true })
}
