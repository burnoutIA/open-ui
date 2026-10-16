import fs from 'fs'
import path from 'path'

export const CONFIG_FILE = 'openui.config.json'
export const STYLING_MODES = ['scss', 'tailwind']

// Point d'entrée JS du projet : importe le script de chaque composant qui en a un.
const DEFAULT_SCRIPT_ENTRY = 'dev/assets/js/main.js'

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
  const scriptEntry = raw.scriptEntry ?? DEFAULT_SCRIPT_ENTRY

  return {
    styling,
    styleEntry: path.resolve(root, styleEntry.replace(/^\/+/, '')),
    scriptEntry: path.resolve(root, scriptEntry.replace(/^\/+/, ''))
  }
}
