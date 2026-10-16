import fs from 'fs'

export const EMPTY_PROJECT_STYLESHEET = '/* Open UI: no project stylesheet yet. */\n'

export function createProjectStylesheetSource(filePath) {
  if (!fs.existsSync(filePath)) return EMPTY_PROJECT_STYLESHEET

  const sassPath = filePath
    .replaceAll('\\', '/')
    .replaceAll('"', '\\"')

  return `@use "${sassPath}";\n`
}
