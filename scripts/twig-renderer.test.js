import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildDefaultsPrelude, renderTwig } from './twig-renderer.js'

let root

function write(relativePath, content) {
  const file = path.join(root, relativePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'openui-twig-'))
  write('dev/components/note/note.json', JSON.stringify({
    variants: { tone: { type: 'select', default: 'info', options: ['info', 'danger'] } },
    content: {
      text: { type: 'text', default: "L'aide" },
      links: { type: 'array', default: [{ text: 'A', href: '/a' }] }
    }
  }))
  write('dev/components/note/note.twig', '<p class="note--{{ tone }}">{{ text }}|{% for l in links %}{{ l.text }}{% endfor %}</p>')
  write('dev/pages/layout-page.json', JSON.stringify({ content: { title: { type: 'text', default: 'Contact' } } }))
  write('dev/pages/layout-page.twig', "{% extends 'dev/layouts/base.twig' %}{% set current = '/c' %}{% block content %}{{ title }}{% endblock %}")
  write('dev/layouts/base.twig', '<title>{{ site.name }}</title>[{{ current }}]{% block content %}{% endblock %}')
  write('dev/data/site.json', JSON.stringify({ name: 'Mon site' }))
  write('dev/pages/page.twig', "{% include 'dev/components/note/note.twig' with { tone: 'danger', text: '' } only %}{% include 'dev/components/note/note.twig' with {} only %}")
})

afterAll(() => fs.rmSync(root, { recursive: true, force: true }))

describe('twig-renderer', () => {
  it('applique les défauts du JSON à un composant inclus avec only', async () => {
    const html = await renderTwig(root, path.join(root, 'dev/pages/page.twig'))
    expect(html).toContain('<p class="note--info">L\'aide|A</p>')
  })

  it('respecte une valeur passée, même vide', async () => {
    const html = await renderTwig(root, path.join(root, 'dev/pages/page.twig'))
    expect(html).toContain('<p class="note--danger">|A</p>')
  })

  it('rend une page qui étend un gabarit, avec ses défauts et les données du site', async () => {
    const html = await renderTwig(root, path.join(root, 'dev/pages/layout-page.twig'))
    expect(html).toBe('<title>Mon site</title>[/c]Contact')
  })

  it('produit un prélude sur une seule ligne, sans sortie', () => {
    const prelude = buildDefaultsPrelude({ content: { text: { default: 'a\nb' } } })
    expect(prelude).not.toContain('\n')
    expect(prelude).toBe("{% set text = text ?? 'a\\nb' %}")
  })
})
