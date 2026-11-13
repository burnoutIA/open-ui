import fs from 'fs'
import path from 'path'
import { CONTRAST_PAIRS, contrastRatio } from '../../scripts/tokens-contrast.js'

// Page « Design tokens » du Showcase : lit le fichier de tokens du projet (SCSS ou Tailwind) et l'affiche
// dans l'aperçu, où la feuille du projet est chargée. Les échantillons utilisent donc les vraies valeurs
// (var(--…)), polices et ombres comprises ; les valeurs écrites viennent du fichier source.

export const TOKENS_ENTRY_KEY = 'tokens:tokens'

const GROUPS = [
  { id: 'palette', title: 'Palette', hint: 'Valeurs brutes. Jamais utilisées directement dans un composant.', test: (name, value) => name.startsWith('--color-') && !isReference(value) },
  { id: 'roles', title: 'Rôles de couleur', hint: 'Intentions UI : les seules couleurs qu’un composant utilise.', test: (name, value) => name.startsWith('--color-') && isReference(value) },
  { id: 'fonts', title: 'Polices', test: (name) => /^--font-(?!weight)/.test(name) },
  { id: 'text', title: 'Tailles de texte', test: (name) => name.startsWith('--text-') },
  { id: 'weights', title: 'Graisses', test: (name) => name.startsWith('--font-weight-') },
  { id: 'leading', title: 'Interlignes', test: (name) => name.startsWith('--leading-') },
  { id: 'spacing', title: 'Espacements', test: (name) => name.startsWith('--spacing-') },
  { id: 'radius', title: 'Rayons', test: (name) => name.startsWith('--radius-') },
  { id: 'shadow', title: 'Ombres', test: (name) => name.startsWith('--shadow-') },
  { id: 'motion', title: 'Mouvement', test: (name) => /^--(duration|ease)-/.test(name) },
  { id: 'layout', title: 'Mise en page', test: (name) => /^--(container|gutter|grid|breakpoint)/.test(name) },
  { id: 'z', title: 'Superposition (z-index)', test: (name) => name.startsWith('--z-') },
  { id: 'other', title: 'Autres', test: () => true }
]

function isReference(value) {
  return /^var\(\s*--[\w-]+\s*\)$/.test(value)
}

// Déclarations `--nom: valeur;` dans l'ordre du fichier, sans les commentaires ; la première occurrence
// d'un nom gagne (valeur de base, avant les surcharges responsives).
export function parseTokenDeclarations(source) {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
  const tokens = new Map()
  for (const [, name, value] of code.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
    if (!tokens.has(name)) tokens.set(name, value.trim())
  }
  return tokens
}

function resolve(tokens, name, seen = new Set()) {
  const value = tokens.get(name)
  if (value === undefined || seen.has(name)) return value
  const reference = value.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (!reference) return value
  seen.add(name)
  return resolve(tokens, reference[1], seen) ?? value
}

function hexToRgb(value = '') {
  const hex = value.replace('#', '')
  const full = hex.length === 3 ? [...hex].map((char) => char + char).join('') : hex
  return /^[0-9a-f]{6}$/i.test(full) ? [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16)) : null
}

// Paliers responsifs : map Sass en mode SCSS, --breakpoint-* en Tailwind (défauts Tailwind sinon).
function readBreakpoints(config, tokens) {
  if (config.styling === 'scss') {
    const file = path.join(path.dirname(config.tokensFile), '_breakpoints.scss')
    if (!fs.existsSync(file)) return []
    const map = fs.readFileSync(file, 'utf8').match(/\$breakpoints\s*:\s*\(([\s\S]*?)\)\s*;/)
    return map ? [...map[1].matchAll(/['"]?([\w-]+)['"]?\s*:\s*([^,\n]+)/g)].map(([, name, value]) => ({ name, value: value.trim() })) : []
  }
  const declared = [...tokens].filter(([name]) => name.startsWith('--breakpoint-'))
  const pairs = declared.length ? declared : [['sm', '40rem'], ['md', '48rem'], ['lg', '64rem'], ['xl', '80rem'], ['2xl', '96rem']]
  return pairs.map(([name, value]) => ({ name: name.replace('--breakpoint-', ''), value }))
}

export function readProjectTokens(config, root = process.cwd()) {
  if (!fs.existsSync(config.tokensFile)) return null
  const tokens = parseTokenDeclarations(fs.readFileSync(config.tokensFile, 'utf8'))
  const groups = GROUPS.map((group) => ({ ...group, tokens: [] }))
  for (const [name, value] of tokens) {
    if (name.startsWith('--breakpoint-')) continue
    groups.find((group) => group.test(name, value)).tokens.push({ name, value, resolved: resolve(tokens, name) })
  }

  const contrast = CONTRAST_PAIRS.map(([fg, bg, min, usage]) => {
    const [fgRgb, bgRgb] = [hexToRgb(resolve(tokens, fg)), hexToRgb(resolve(tokens, bg))]
    const present = tokens.has(fg) && tokens.has(bg)
    const ratio = fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : null
    return { fg, bg, min, usage, present, ratio, ok: ratio !== null && ratio >= min }
  }).filter((pair) => pair.present)

  return {
    file: path.relative(root, config.tokensFile).split(path.sep).join('/'),
    styling: config.styling,
    count: tokens.size,
    groups: groups.filter((group) => group.tokens.length),
    contrast,
    breakpoints: readBreakpoints(config, tokens)
  }
}

export function tokensCatalogEntry(config) {
  if (!fs.existsSync(config.tokensFile)) return null
  return {
    id: 'tokens',
    key: TOKENS_ENTRY_KEY,
    type: 'tokens',
    level: 'foundation',
    name: 'Design tokens',
    category: 'Couleurs, typo, espacements',
    description: 'Les tokens du projet tels qu’ils sont déclarés et rendus. Cliquer un nom copie son var(--…).'
  }
}

// ── Rendu ────────────────────────────────────────────────────────────────────

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function tokenName(name) {
  return `<button class="ot-name" type="button" data-copy-token="var(${escapeHtml(name)})">${escapeHtml(name)}</button>`
}

function tokenValue(token) {
  const reference = token.value.match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (!reference) return `<code class="ot-value">${escapeHtml(token.value)}</code>`
  // Un seul élément : référence et valeur résolue restent dans la même colonne.
  const resolved = token.resolved !== token.value ? ` · <code class="ot-value">${escapeHtml(token.resolved)}</code>` : ''
  return `<span class="ot-ref">→ ${escapeHtml(reference[1])}${resolved}</span>`
}

const SAMPLE = 'Portez ce vieux whisky au juge blond qui fume'

const RENDERERS = {
  palette: (tokens) => `<ul class="ot-swatches" role="list">${tokens.map((token) => `
    <li class="ot-swatch"><span class="ot-swatch__color" style="background: var(${token.name})"></span>${tokenName(token.name)}${tokenValue(token)}</li>`).join('')}
  </ul>`,
  roles: (tokens) => `<ul class="ot-rows" role="list">${tokens.map((token) => `
    <li class="ot-row"><span class="ot-chip" style="background: var(${token.name})"></span>${tokenName(token.name)}${tokenValue(token)}</li>`).join('')}
  </ul>`,
  fonts: (tokens) => tokens.map((token) => `
    <div class="ot-font">${tokenName(token.name)}<p class="ot-font__sample" style="font-family: var(${token.name})">${SAMPLE}</p><code class="ot-value">${escapeHtml(token.value)}</code></div>`).join(''),
  text: (tokens) => `<ul class="ot-rows" role="list">${tokens.map((token) => `
    <li class="ot-row ot-row--sample">${tokenName(token.name)}<code class="ot-value">${escapeHtml(token.value)}</code><span class="ot-sample" style="font-size: var(${token.name})">${SAMPLE}</span></li>`).join('')}
  </ul>`,
  weights: (tokens) => `<ul class="ot-rows" role="list">${tokens.map((token) => `
    <li class="ot-row ot-row--sample">${tokenName(token.name)}<code class="ot-value">${escapeHtml(token.value)}</code><span class="ot-sample" style="font-weight: var(${token.name})">${SAMPLE}</span></li>`).join('')}
  </ul>`,
  leading: (tokens) => `<div class="ot-columns">${tokens.map((token) => `
    <div class="ot-leading">${tokenName(token.name)}<code class="ot-value">${escapeHtml(token.value)}</code><p style="line-height: var(${token.name})">${SAMPLE}. ${SAMPLE}.</p></div>`).join('')}
  </div>`,
  spacing: (tokens) => `<ul class="ot-rows" role="list">${tokens.map((token) => `
    <li class="ot-row ot-row--sample">${tokenName(token.name)}${tokenValue(token)}<span class="ot-bar" style="width: var(${token.name})"></span></li>`).join('')}
  </ul>`,
  radius: (tokens) => `<ul class="ot-tiles" role="list">${tokens.map((token) => `
    <li class="ot-tile"><span class="ot-tile__shape" style="border-radius: var(${token.name})"></span>${tokenName(token.name)}${tokenValue(token)}</li>`).join('')}
  </ul>`,
  shadow: (tokens) => `<ul class="ot-tiles ot-tiles--stage" role="list">${tokens.map((token) => `
    <li class="ot-tile"><span class="ot-tile__shape ot-tile__shape--flat" style="box-shadow: var(${token.name})"></span>${tokenName(token.name)}</li>`).join('')}
  </ul>`
}

function renderTable(tokens) {
  return `<ul class="ot-rows" role="list">${tokens.map((token) => `
    <li class="ot-row">${tokenName(token.name)}${tokenValue(token)}</li>`).join('')}
  </ul>`
}

function renderContrast(contrast) {
  return `<section class="ot-section" aria-labelledby="ot-contrast">
  <h2 id="ot-contrast">Contrastes garantis</h2>
  <p class="ot-hint">Paires de rôles vérifiées par <code>npm run health</code> : 4.5:1 pour le texte, 3:1 pour les contours et le focus.</p>
  <ul class="ot-contrast" role="list">${contrast.map((pair) => {
    const verdict = pair.ratio === null ? 'non vérifiable' : `${pair.ratio.toFixed(2)}:1 ${pair.ok ? '✓' : '✗'} (min. ${pair.min}:1)`
    return `
    <li class="ot-contrast__pair${pair.ratio !== null && !pair.ok ? ' ot-contrast__pair--fail' : ''}">
      <span class="ot-contrast__sample" style="color: var(${escapeHtml(pair.fg)}); background: var(${escapeHtml(pair.bg)}); border-color: var(${escapeHtml(pair.fg)})">Aa</span>
      <span class="ot-contrast__label"><strong>${escapeHtml(pair.usage)}</strong><span>${escapeHtml(pair.fg)} sur ${escapeHtml(pair.bg)}</span><span>${verdict}</span></span>
    </li>`
  }).join('')}
  </ul>
</section>`
}

function renderBreakpoints(breakpoints) {
  const toPx = (value) => (value.endsWith('rem') ? parseFloat(value) * 16 : parseFloat(value))
  const max = Math.max(...breakpoints.map((breakpoint) => toPx(breakpoint.value)))
  return `<section class="ot-section" aria-labelledby="ot-breakpoints">
  <h2 id="ot-breakpoints">Points de rupture</h2>
  <p class="ot-hint">Mobile first : chaque palier s’applique à partir de cette largeur.</p>
  <ul class="ot-rows" role="list">${breakpoints.map((breakpoint) => `
    <li class="ot-row ot-row--sample"><code class="ot-value ot-value--strong">${escapeHtml(breakpoint.name)}</code><code class="ot-value">${escapeHtml(breakpoint.value)} · ${Math.round(toPx(breakpoint.value))} px</code><span class="ot-bar ot-bar--muted" style="width: ${(toPx(breakpoint.value) / max * 100).toFixed(1)}%"></span></li>`).join('')}
  </ul>
</section>`
}

export function renderTokensPage(tokens) {
  if (!tokens) return '<p class="ot-hint">Aucun fichier de tokens : posez le kit de départ du mode de style.</p>'
  const sections = tokens.groups.map((group) => {
    const render = RENDERERS[group.id] ?? renderTable
    const section = `<section class="ot-section" aria-labelledby="ot-${group.id}">
  <h2 id="ot-${group.id}">${escapeHtml(group.title)} <span class="ot-count">${group.tokens.length}</span></h2>
  ${group.hint ? `<p class="ot-hint">${escapeHtml(group.hint)}</p>` : ''}
  ${render(group.tokens)}
</section>`
    if (group.id === 'roles' && tokens.contrast.length) return section + renderContrast(tokens.contrast)
    if (group.id === 'layout' && tokens.breakpoints.length) return section + renderBreakpoints(tokens.breakpoints)
    return section
  })

  if (tokens.breakpoints.length && !tokens.groups.some((group) => group.id === 'layout')) sections.push(renderBreakpoints(tokens.breakpoints))

  return `<div class="openui-tokens">
  <p class="ot-source"><code>${escapeHtml(tokens.file)}</code> · mode ${escapeHtml(tokens.styling)} · ${tokens.count} tokens</p>
  <p class="ot-copied" role="status" data-copy-status></p>
  ${sections.join('\n')}
</div>`
}
