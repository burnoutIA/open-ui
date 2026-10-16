import Prism from 'prismjs'

// Prism échappe le source avant de produire ses <span class="token ...">,
// le résultat peut donc être injecté tel quel dans le <code> du panneau.
export function highlightHtml(source) {
  return Prism.highlight(source, Prism.languages.markup, 'markup')
}
