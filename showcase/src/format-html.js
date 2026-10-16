// Reformate le HTML affiché et copié dans le Showcase : une balise de bloc par ligne, indentation régulière.
// Seuls les blancs sont touchés, et seulement là où le navigateur les ignore déjà :
// - entre éléments de bloc, les blancs disparaissent ;
// - dans un contenu en ligne, toute suite de blancs devient une espace (rendu identique) ;
// - pre, textarea, script et style sont recopiés tels quels.

const BLOCK = new Set([
  'html', 'head', 'body', 'header', 'footer', 'main', 'nav', 'section', 'article', 'aside', 'div',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'form', 'fieldset',
  'legend', 'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'figure', 'figcaption',
  'blockquote', 'details', 'summary', 'dialog', 'hr', 'meta', 'link', 'title', 'base', 'template',
  'pre', 'textarea', 'script', 'style', 'noscript'
])
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const RAW = new Set(['pre', 'textarea', 'script', 'style'])
const TOKEN = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/?[a-zA-Z][^\s/>]*(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+|</gi

function parse(html) {
  const root = { children: [] }
  const stack = [root]
  const tokens = html.match(TOKEN) ?? []

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]
    const parent = stack.at(-1)

    if (token.startsWith('<!--') || /^<!doctype/i.test(token)) {
      parent.children.push({ raw: token, block: true })
      continue
    }

    const close = token.match(/^<\/([a-zA-Z][^\s>]*)/)
    if (close) {
      const name = close[1].toLowerCase()
      const index = stack.findLastIndex((node) => node.name === name)
      if (index > 0) stack.length = index
      continue
    }

    const open = token.match(/^<([a-zA-Z][^\s/>]*)/)
    if (!open) {
      parent.children.push({ text: token })
      continue
    }

    const name = open[1].toLowerCase()
    const node = { name, tag: token, children: [], block: BLOCK.has(name) }
    parent.children.push(node)

    if (RAW.has(name)) {
      // Contenu recopié tel quel jusqu'à la balise fermante.
      let raw = ''
      while (i + 1 < tokens.length && !new RegExp(`^</${name}\\b`, 'i').test(tokens[i + 1])) raw += tokens[++i]
      node.raw = raw
      i += 1
      continue
    }

    if (!VOID.has(name) && !token.endsWith('/>')) stack.push(node)
  }

  return root
}

function inline(node) {
  if (node.text !== undefined) return node.text.replace(/\s+/g, ' ')
  if (node.raw !== undefined && !node.name) return node.raw
  if (node.raw !== undefined) return `${node.tag}${node.raw}</${node.name}>`
  const close = VOID.has(node.name) || node.tag.endsWith('/>') ? '' : `</${node.name}>`
  return `${node.tag}${node.children.map(inline).join('')}${close}`
}

function hasBlockChild(node) {
  return node.children?.some((child) => child.block)
}

function serialize(nodes, depth) {
  const pad = '  '.repeat(depth)
  const lines = []
  let run = ''

  const flush = () => {
    const text = run.trim()
    if (text) lines.push(pad + text)
    run = ''
  }

  for (const node of nodes) {
    // Entre blocs, un blanc entre deux éléments en ligne vaut un saut de ligne : on coupe là.
    if (node.text !== undefined && !node.text.trim()) {
      flush()
      continue
    }
    if (!node.block) {
      run += inline(node)
      continue
    }
    flush()

    if (node.raw !== undefined) {
      lines.push(pad + (node.name ? `${node.tag}${node.raw}</${node.name}>` : node.raw))
    } else if (VOID.has(node.name) || node.tag.endsWith('/>')) {
      lines.push(pad + node.tag)
    } else if (!hasBlockChild(node)) {
      lines.push(pad + node.tag + node.children.map(inline).join('').replace(/^\s+|\s+$/g, '') + `</${node.name}>`)
    } else {
      lines.push(pad + node.tag, ...serialize(node.children, depth + 1), `${pad}</${node.name}>`)
    }
  }

  flush()
  return lines
}

export function formatHtml(html) {
  if (typeof html !== 'string' || !html.trim()) return ''
  return serialize(parse(html).children, 0).join('\n')
}
