import fs from 'fs'
import path from 'path'

export const CONFIG_FILE = 'openui.config.json'
export const STYLING_MODES = ['scss', 'tailwind']

const DEFAULT_STYLE_ENTRIES = {
  scss: 'dev/assets/scss/style.scss',
  tailwind: 'dev/assets/css/style.css'
}

// Lit openui.config.json. Le fichier est facultatif : sans lui, le projet est en mode SCSS.
export function loadOpenUIConfig(root = process.cwd()) {
  const configPath = path.join(root, CONFIG_FILE)
  const raw = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {}
  const styling = raw.styling ?? 'scss'

  if (!STYLING_MODES.includes(styling)) {
    throw new Error(`${CONFIG_FILE} : "styling" doit valoir ${STYLING_MODES.map((mode) => `"${mode}"`).join(' ou ')}, reçu "${styling}".`)
  }

  const styleEntry = raw.styleEntry ?? DEFAULT_STYLE_ENTRIES[styling]

  return {
    styling,
    styleEntry: path.resolve(root, styleEntry.replace(/^\/+/, ''))
  }
}
