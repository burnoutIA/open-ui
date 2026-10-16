import fs from 'fs'

export const EMPTY_PROJECT_STYLESHEET = '/* Open UI: no project stylesheet yet. */\n'

export function createProjectStylesheetSource(filePath, styling = 'scss') {
  if (!fs.existsSync(filePath)) return EMPTY_PROJECT_STYLESHEET

  const importPath = filePath
    .replaceAll('\\', '/')
    .replaceAll('"', '\\"')

  return styling === 'tailwind' ? `@import "${importPath}";\n` : `@use "${importPath}";\n`
}
