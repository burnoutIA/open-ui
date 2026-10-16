// Contrôle des paires de contraste entre tokens de rôle (WCAG 2.x / RGAA 3.2 et 3.3).
// Lit les déclarations `--nom: valeur;` d'un fichier de tokens (SCSS :root ou CSS @theme) et résout les var().

// [premier plan, arrière-plan, ratio minimal, usage]
export const CONTRAST_PAIRS = [
  ['--color-text', '--color-surface', 4.5, 'texte courant'],
  ['--color-text-muted', '--color-surface', 4.5, 'texte secondaire'],
  ['--color-text', '--color-surface-muted', 4.5, 'texte sur surface atténuée'],
  ['--color-on-primary', '--color-primary', 4.5, 'texte de bouton principal'],
  ['--color-on-primary', '--color-primary-hover', 4.5, 'texte de bouton principal survolé'],
  ['--color-on-danger', '--color-danger', 4.5, 'texte de bouton destructif'],
  ['--color-on-danger', '--color-danger-hover', 4.5, 'texte de bouton destructif survolé'],
  ['--color-link', '--color-surface', 4.5, 'lien'],
  ['--color-info-text', '--color-info-surface', 4.5, 'statut info'],
  ['--color-success-text', '--color-success-surface', 4.5, 'statut succès'],
  ['--color-warning-text', '--color-warning-surface', 4.5, 'statut avertissement'],
  ['--color-danger-text', '--color-danger-surface', 4.5, 'statut danger'],
  ['--color-danger-text', '--color-surface', 4.5, "message d'erreur"],
  ['--color-border-strong', '--color-surface', 3, 'contour de champ'],
  ['--color-focus', '--color-surface', 3, 'indicateur de focus']
]

export function parseTokens(source) {
  const tokens = {}
  for (const match of source.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokens[match[1]] = match[2].trim()
  return tokens
}

export function resolveToken(tokens, name, seen = new Set()) {
  const value = tokens[name]
  if (value === undefined || seen.has(name)) return undefined
  const reference = value.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (!reference) return value
  seen.add(name)
  return resolveToken(tokens, reference[1], seen)
}

function hexToRgb(value) {
  const hex = value.replace('#', '')
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
}

function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

export function contrastRatio(foreground, background) {
  const [a, b] = [luminance(foreground), luminance(background)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}

// Retourne les paires vérifiées ; `skipped` signale un token absent ou non hexadécimal.
export function checkTokenContrast(source) {
  const tokens = parseTokens(source)
  return CONTRAST_PAIRS.map(([fg, bg, min, usage]) => {
    const fgRgb = hexToRgb(resolveToken(tokens, fg) ?? '')
    const bgRgb = hexToRgb(resolveToken(tokens, bg) ?? '')
    if (!fgRgb || !bgRgb) return { fg, bg, min, usage, skipped: true }
    const ratio = contrastRatio(fgRgb, bgRgb)
    return { fg, bg, min, usage, ratio, ok: ratio >= min }
  })
}
