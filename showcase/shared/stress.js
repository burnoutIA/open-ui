// Paliers de stress du contenu : même définition pour le Showcase et, plus tard, snapshot.
// Texte en latin : il se voit comme du remplissage et laisse regarder la mise en page, pas le sens.

import { fakeImageUrl } from './fake-image.js'

const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et ' +
  'dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ' +
  'ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore ' +
  'eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia ' +
  'deserunt mollit anim id est laborum'
).split(' ')

// Le cas qui casse le plus souvent une mise en page : un mot sans espace (URL, nom propre, référence).
export const ENDLESS_WORD = 'Loremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlabore'

// Texte déterministe : mêmes mots à chaque fois, pour des captures comparables.
export function lorem(count) {
  const words = Array.from({ length: count }, (_, index) => WORDS[index % WORDS.length])
  const text = words.join(' ')
  const sentence = text.charAt(0).toUpperCase() + text.slice(1)
  return count >= 6 ? `${sentence}.` : sentence
}

const TEXT_STEPS = [
  ...[3, 6, 12, 24, 48, 96, 192].map((count) => ({ label: `${count} mots`, value: () => lorem(count) })),
  { label: 'mot interminable', value: () => ENDLESS_WORD },
  { label: 'vide', value: () => '' }
]

const NUMBER_STEPS = [0, 1, 99, 9999, 1000000, -42].map((number) => ({
  label: number.toLocaleString('fr-FR'),
  value: () => number
}))

// Listes : les éléments d'origine sont répétés pour atteindre la taille voulue ; sans élément d'origine,
// `createItem` fabrique un élément à partir du schéma.
const ARRAY_STEPS = [0, 1, 5, 20].map((count) => ({
  label: `${count} élément${count > 1 ? 's' : ''}`,
  value: (original, createItem) => {
    const source = Array.isArray(original) && original.length ? original : [createItem()]
    return Array.from({ length: count }, (_, index) => structuredClone(source[index % source.length]))
  }
}))

// Images : une mire par format, le texte alternatif d'origine est conservé.
const IMAGE_STEPS = [
  ['paysage', 1600, 900],
  ['portrait', 900, 1600],
  ['carré', 1200, 1200],
  ['panoramique', 2400, 600],
  ['minuscule', 80, 60]
].map(([label, width, height]) => ({
  label,
  value: (original) => ({ src: fakeImageUrl(width, height), alt: original?.alt ?? '' })
})).concat({ label: 'absente', value: (original) => ({ src: '', alt: original?.alt ?? '' }) })

// `"stress": false` sur un contrôle : prop technique (identifiant, URL...) sans intérêt à stresser.
export function stressSteps(control) {
  if (control.stress === false) return []
  if (control.type === 'text') return TEXT_STEPS
  if (control.type === 'number') {
    return NUMBER_STEPS.filter((step) => {
      const value = step.value()
      return (!Object.hasOwn(control, 'min') || value >= control.min) && (!Object.hasOwn(control, 'max') || value <= control.max)
    })
  }
  if (control.type === 'array') return ARRAY_STEPS
  if (control.type === 'image') return IMAGE_STEPS
  return []
}
