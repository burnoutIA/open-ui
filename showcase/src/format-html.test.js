import { describe, expect, it } from 'vitest'
import { formatHtml } from './format-html.js'

describe('formatHtml', () => {
  it('met une balise de bloc par ligne et indente', () => {
    const html = '<footer class="f">\n  <div><nav aria-label="Liens">\n      <ul>        <li><a href="/a">A</a>\n</li>        <li><a href="/b">B</a>\n</li>      </ul>\n    </nav>\n    <p>© 2026</p>\n  </div>\n</footer>\n'
    expect(formatHtml(html)).toBe([
      '<footer class="f">',
      '  <div>',
      '    <nav aria-label="Liens">',
      '      <ul>',
      '        <li><a href="/a">A</a></li>',
      '        <li><a href="/b">B</a></li>',
      '      </ul>',
      '    </nav>',
      '    <p>© 2026</p>',
      '  </div>',
      '</footer>'
    ].join('\n'))
  })

  it('garde une espace entre deux contenus en ligne', () => {
    expect(formatHtml('<label for="e">Adresse\n  e-mail <span aria-hidden="true">*</span></label>'))
      .toBe('<label for="e">Adresse e-mail <span aria-hidden="true">*</span></label>')
    expect(formatHtml('<p><a href="/a">A</a>\n<a href="/b">B</a></p>')).toBe('<p><a href="/a">A</a> <a href="/b">B</a></p>')
  })

  it('passe à la ligne entre éléments en ligne séparés par un blanc, dans un bloc qui contient des blocs', () => {
    expect(formatHtml('<div><a href="/">Accueil</a>\n  <button type="button">Menu</button><nav><ul><li>x</li></ul></nav></div>')).toBe([
      '<div>',
      '  <a href="/">Accueil</a>',
      '  <button type="button">Menu</button>',
      '  <nav>',
      '    <ul>',
      '      <li>x</li>',
      '    </ul>',
      '  </nav>',
      '</div>'
    ].join('\n'))
  })

  it('passe à la ligne entre éléments en ligne d’un bloc sans texte direct', () => {
    expect(formatHtml('<div class="f"><label for="n">Nom</label>\n  <input id="n"></div>'))
      .toBe('<div class="f">\n  <label for="n">Nom</label>\n  <input id="n">\n</div>')
    expect(formatHtml('<p>Texte <a href="/">lien</a>\n <b>gras</b></p>')).toBe('<p>Texte <a href="/">lien</a> <b>gras</b></p>')
  })

  it('ne coupe pas les éléments vides, les attributs avec > ni le contenu brut', () => {
    expect(formatHtml('<div>\n<input type="text" data-x="a>b">\n</div>')).toBe('<div><input type="text" data-x="a>b"></div>')
    expect(formatHtml('<div><pre>  a\n    b</pre></div>')).toBe('<div>\n  <pre>  a\n    b</pre>\n</div>')
  })

  it('formate un document complet', () => {
    const html = '<!DOCTYPE html>\n<html lang="fr"><head><meta charset="UTF-8"><title>T</title></head><body><main id="c"><h1>Titre</h1></main></body></html>'
    expect(formatHtml(html)).toBe([
      '<!DOCTYPE html>',
      '<html lang="fr">',
      '  <head>',
      '    <meta charset="UTF-8">',
      '    <title>T</title>',
      '  </head>',
      '  <body>',
      '    <main id="c">',
      '      <h1>Titre</h1>',
      '    </main>',
      '  </body>',
      '</html>'
    ].join('\n'))
  })
})
