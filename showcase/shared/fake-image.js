// Images d'exemple générées localement (aucun service externe) : une mire qui affiche sa taille et son ratio,
// pour voir d'un coup d'œil comment un composant recadre une image paysage, portrait ou panoramique.
//   /__openui/fake-image/1600x900.svg            servie par le serveur de dev
//   fake_image(1600, 900, 'Atelier')             fonction Twig, pour les pages en construction
// Au build, chaque image utilisée devient un fichier statique.

export const FAKE_IMAGE_PREFIX = '/__openui/fake-image/'
const MAX_SIDE = 4000

// Libellé entièrement encodé, apostrophes comprises : l'URL reste sûre dans un attribut HTML.
function encodeLabel(label) {
  return encodeURIComponent(label).replace(/['()!*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
}

export function fakeImageUrl(width, height, label = '') {
  const query = label ? `?label=${encodeLabel(label)}` : ''
  return `${FAKE_IMAGE_PREFIX}${Math.round(width)}x${Math.round(height)}.svg${query}`
}

// `/__openui/fake-image/1600x900.svg?label=x` → { width, height, label } ; null si invalide.
export function parseFakeImageUrl(url) {
  const parsed = new URL(url, 'http://localhost')
  if (!parsed.pathname.startsWith(FAKE_IMAGE_PREFIX)) return null
  const match = parsed.pathname.slice(FAKE_IMAGE_PREFIX.length).match(/^(\d{1,4})x(\d{1,4})\.svg$/)
  if (!match) return null
  const [width, height] = [Number(match[1]), Number(match[2])]
  if (!width || !height || width > MAX_SIDE || height > MAX_SIDE) return null
  return { width, height, label: parsed.searchParams.get('label') ?? '' }
}

function gcd(a, b) {
  return b ? gcd(b, a % b) : a
}

export function ratioLabel(width, height) {
  const divisor = gcd(width, height)
  const [w, h] = [width / divisor, height / divisor]
  return w <= 32 && h <= 32 ? `${w}:${h}` : `${(width / height).toFixed(2)}:1`
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

// Couleur selon l'orientation : paysage, portrait et carré se distinguent sans lire le texte.
function palette(width, height) {
  if (width > height) return { background: '#dbe7f3', ink: '#1e3a5f', line: '#a9c1db' }
  if (height > width) return { background: '#efe2d3', ink: '#5c3a17', line: '#d6bc9c' }
  return { background: '#dfece2', ink: '#1f4a2c', line: '#b1cfb8' }
}

export function renderFakeImage(width, height, label = '') {
  const { background, ink, line } = palette(width, height)
  const size = Math.max(8, Math.round(Math.min(width, height) / 9))
  const small = Math.max(6, Math.round(size * 0.55))
  const lines = [label, `${width} × ${height}`, ratioLabel(width, height)].filter(Boolean)
  const top = height / 2 - ((lines.length - 1) * size * 0.65)
  const text = lines.map((content, index) => {
    const isSize = content === `${width} × ${height}`
    return `<text x="50%" y="${Math.round(top + index * size * 1.3)}" font-size="${isSize ? size : small}" font-weight="${isSize ? 700 : 400}">${escapeXml(content)}</text>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="${background}"/>` +
    `<path d="M0 0L${width} ${height}M${width} 0L0 ${height}" stroke="${line}" stroke-width="${Math.max(1, Math.round(size / 12))}"/>` +
    `<rect x="${size / 4}" y="${size / 4}" width="${width - size / 2}" height="${height - size / 2}" fill="none" stroke="${line}" stroke-width="${Math.max(1, Math.round(size / 12))}" stroke-dasharray="${size / 2} ${size / 3}"/>` +
    `<g fill="${ink}" font-family="system-ui, sans-serif" text-anchor="middle" dominant-baseline="middle">${text}</g>` +
    '</svg>'
}
