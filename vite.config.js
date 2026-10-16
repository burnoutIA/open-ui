import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import Twig from 'twig'
import { SHOWCASE_API } from './showcase/shared/protocol.js'
import { getShowcaseCatalog, getShowcaseEntry, normalizeShowcaseProps } from './showcase/server/catalog.js'
import { readJsonBody, sendJson } from './showcase/server/http.js'
import { createProjectStylesheetSource } from './showcase/server/project-style.js'
import { validateHtmlWithW3c } from './showcase/server/html-validator.js'

const ROOT = process.cwd()
const PAGES_DIR = path.join(ROOT, 'dev/pages')
const SKETCHES_DIR = path.join(ROOT, 'dev/sketches')
const SHOWCASE_DIR = path.join(ROOT, 'showcase')
const PROJECT_STYLESHEET = path.join(ROOT, 'dev/assets/scss/style.scss')
const OUT_DIR = path.join(ROOT, 'public')
const PUBLIC_SKETCHES_DIR = path.join(OUT_DIR, 'sketches')
const FULL_RELOAD_DELAY = 150
const PROJECT_STYLESHEET_ID = 'virtual:openui-project-styles.scss'
const RESOLVED_PROJECT_STYLESHEET_ID = `\0${PROJECT_STYLESHEET_ID}`

// Les includes utilisent des chemins depuis la racine ('dev/components/...')
// settings.views = ROOT indique à twig 3.x d'utiliser ROOT comme base de résolution.
function renderTwig(filePath, data = {}) {
  return new Promise((resolve, reject) => {
    Twig.cache(false)
    Twig.renderFile(filePath, { ...data, settings: { views: ROOT } }, (err, html) => {
      if (err) reject(err)
      else resolve(html)
    })
  })
}

function copySketchesToPublic() {
  if (!fs.existsSync(SKETCHES_DIR)) return
  fs.rmSync(PUBLIC_SKETCHES_DIR, { recursive: true, force: true })
  fs.cpSync(SKETCHES_DIR, PUBLIC_SKETCHES_DIR, { recursive: true })
}

function listPageSlugs() {
  if (!fs.existsSync(PAGES_DIR)) return []
  return fs.readdirSync(PAGES_DIR)
    .filter(file => file.endsWith('.twig'))
    .map(file => file.replace('.twig', ''))
    .sort()
}

function listSketchSlugs() {
  if (!fs.existsSync(SKETCHES_DIR)) return []
  return fs.readdirSync(SKETCHES_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function renderWorkspaceIndex(pages, sketches) {
  const pageContent = pages.length
    ? `<ul>${pages.map(slug => `<li><a href="./${encodeURIComponent(slug)}.html">${escapeHtml(slug)}</a></li>`).join('\n')}</ul>`
    : '<p>Aucune page source.</p>'
  const sketchContent = sketches.length
    ? `<ul>${sketches.map(slug => `<li><a href="./sketches/${encodeURIComponent(slug)}/">${escapeHtml(slug)}</a> <small>sketch</small></li>`).join('\n')}</ul>`
    : '<p>Aucune esquisse source.</p>'

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Open UI</title></head><body><main><h1>Open UI</h1><section aria-labelledby="design-system-title"><h2 id="design-system-title">Design system</h2><p><a href="./showcase/">Ouvrir Open UI Showcase</a></p></section><section aria-labelledby="pages-title"><h2 id="pages-title">Pages</h2>${pageContent}</section><section aria-labelledby="sketches-title"><h2 id="sketches-title">Sketches</h2>${sketchContent}</section></main></body></html>`
}

function inlineBuiltStylesheets() {
  if (!fs.existsSync(OUT_DIR)) return

  const htmlFiles = [
    path.join(OUT_DIR, 'index.html'),
    ...listPageSlugs().map(slug => path.join(OUT_DIR, `${slug}.html`))
  ]

  for (const htmlPath of htmlFiles) {
    if (!fs.existsSync(htmlPath)) continue

    const html = fs.readFileSync(htmlPath, 'utf8')
    const inlined = html.replace(/<link\b[^>]*>/gi, (linkTag) => {
      if (!/\brel=["']stylesheet["']/i.test(linkTag)) return linkTag

      const hrefMatch = linkTag.match(/\bhref=["']([^"']+)["']/i)
      if (!hrefMatch) return linkTag

      const href = hrefMatch[1]
      if (/^(?:[a-z]+:|\/\/)/i.test(href)) return linkTag

      const pathname = decodeURIComponent(href.split(/[?#]/, 1)[0])
      const stylesheetPath = path.resolve(path.dirname(htmlPath), pathname)
      const relativeToOutput = path.relative(OUT_DIR, stylesheetPath)

      if (relativeToOutput.startsWith('..') || path.isAbsolute(relativeToOutput)) return linkTag
      if (!fs.existsSync(stylesheetPath)) return linkTag

      const css = fs.readFileSync(stylesheetPath, 'utf8').replaceAll('</style', '<\\/style')
      return `<style data-openui-source="${escapeHtml(href)}">\n${css}\n</style>`
    })

    fs.writeFileSync(htmlPath, inlined, 'utf8')
  }
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath)
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp'
  }

  res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream')
  res.end(fs.readFileSync(filePath))
}

function openUIPlugin() {
  let fullReloadTimer
  const temporaryHtmlPaths = new Set()

  function cleanupTemporaryHtml() {
    for (const filePath of temporaryHtmlPaths) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
    temporaryHtmlPaths.clear()
  }

  return {
    name: 'openui',

    resolveId(id) {
      if (id === PROJECT_STYLESHEET_ID) return RESOLVED_PROJECT_STYLESHEET_ID
    },

    load(id) {
      if (id !== RESOLVED_PROJECT_STYLESHEET_ID) return
      if (fs.existsSync(PROJECT_STYLESHEET)) this.addWatchFile(PROJECT_STYLESHEET)
      return createProjectStylesheetSource(PROJECT_STYLESHEET)
    },

    // Build : rend chaque page Twig → HTML temporaire, passé à Rollup comme entrée
    async config(cfg, { command }) {
      if (command !== 'build') return
      const pages = listPageSlugs()
      const inputs = {}
      for (const slug of pages) {
        const html = await renderTwig(path.join(PAGES_DIR, `${slug}.twig`), {})
        const tmpPath = path.join(ROOT, `${slug}.html`)
        fs.writeFileSync(tmpPath, html, 'utf8')
        temporaryHtmlPaths.add(tmpPath)
        inputs[slug] = tmpPath
      }
      inputs['showcase/index'] = path.join(SHOWCASE_DIR, 'index.html')
      inputs['showcase/preview'] = path.join(SHOWCASE_DIR, 'preview.html')
      if (!inputs.index) {
        const indexPath = path.join(ROOT, 'index.html')
        fs.writeFileSync(indexPath, renderWorkspaceIndex(pages, listSketchSlugs()), 'utf8')
        temporaryHtmlPaths.add(indexPath)
        inputs.index = indexPath
      }
      cfg.build ??= {}
      cfg.build.rollupOptions ??= {}
      cfg.build.rollupOptions.input = inputs
    },

    // Build : nettoie les HTML temporaires puis publie les esquisses séparément
    closeBundle() {
      cleanupTemporaryHtml()
      inlineBuiltStylesheets()
      copySketchesToPublic()
    },

    buildEnd(error) {
      if (error) cleanupTemporaryHtml()
    },

    // Dev : rendu Twig à la volée + preview des esquisses hors DS canonique
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url, 'http://localhost').pathname

        if (pathname === SHOWCASE_API.catalog) {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Méthode non autorisée.' })
            return
          }

          const entries = getShowcaseCatalog()
          sendJson(res, 200, {
            entries,
            counts: {
              components: entries.filter((entry) => entry.type === 'component').length,
              pages: entries.filter((entry) => entry.type === 'page').length
            }
          })
          return
        }

        if (pathname === SHOWCASE_API.render) {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Méthode non autorisée.' })
            return
          }

          try {
            const payload = await readJsonBody(req)
            const entryType = typeof payload.entryType === 'string' ? payload.entryType : ''
            const entryId = typeof payload.entryId === 'string' ? payload.entryId : ''
            const entry = getShowcaseEntry(entryType, entryId)

            if (!entry) {
              sendJson(res, 404, { error: `Entrée Showcase inconnue : ${entryType || 'type absent'}/${entryId || 'identifiant absent'}.` })
              return
            }

            const props = normalizeShowcaseProps(entry.schema, payload.props)
            const html = await renderTwig(entry.twigPath, props)
            sendJson(res, 200, {
              html,
              entry: {
                id: entry.id,
                type: entryType,
                key: `${entryType}:${entry.id}`,
                name: entry.schema.name,
                level: entryType === 'page' ? 'page' : entry.schema.level
              },
              props
            })
          } catch (error) {
            sendJson(res, 422, { error: error.message })
          }
          return
        }

        if (pathname === SHOWCASE_API.validateHtml) {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'Méthode non autorisée.' })
            return
          }

          try {
            const payload = await readJsonBody(req)
            if (typeof payload.html !== 'string' || !payload.html.trim()) {
              sendJson(res, 400, { error: 'Aucun HTML à contrôler.' })
              return
            }

            const result = await validateHtmlWithW3c(payload.html, {
              endpoint: process.env.OPENUI_W3C_VALIDATOR_URL,
              fullDocument: payload.entryType === 'page',
              title: typeof payload.entryName === 'string'
                ? `Open UI — ${payload.entryName}`
                : 'Open UI rendering'
            })
            sendJson(res, 200, result)
          } catch (error) {
            sendJson(res, 502, { error: error.message })
          }
          return
        }

        if (pathname.startsWith('/sketches/')) {
          const relativePath = decodeURIComponent(pathname.replace('/sketches/', ''))
          const requestedPath = path.normalize(path.join(SKETCHES_DIR, relativePath))
          if (!requestedPath.startsWith(SKETCHES_DIR)) return next()
          const filePath = fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()
            ? path.join(requestedPath, 'index.html')
            : requestedPath
          if (!fs.existsSync(filePath)) return next()
          serveFile(filePath, res)
          return
        }

        const slug = pathname === '/' ? null : pathname.slice(1).replace(/\.html$/, '')

        // Index : liste des pages disponibles et esquisses séparées
        if (!slug) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(renderWorkspaceIndex(listPageSlugs(), listSketchSlugs()))
          return
        }

        const twigPath = path.join(PAGES_DIR, `${slug}.twig`)
        if (!fs.existsSync(twigPath)) return next()

        try {
          let html = await renderTwig(twigPath, {})
          html = html.replace('</head>', '  <script type="module" src="/@vite/client"></script>\n</head>')
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
        } catch (e) {
          res.statusCode = 500
          res.end(`<!DOCTYPE html><html><body><pre style="color:red">Twig Error in ${slug}.twig:\n${e.message}</pre></body></html>`)
        }
      })
    },

    // HMR : rechargement complet sur changement de contrat/rendu ou esquisse.
    handleHotUpdate({ file, server }) {
      const isProjectContract = file.includes(`${path.sep}dev${path.sep}`) && /\.(twig|json)$/.test(file)
      const isSketch = file.includes(`${path.sep}dev${path.sep}sketches${path.sep}`)
      const isProjectStylesheet = path.resolve(file) === PROJECT_STYLESHEET

      if (isProjectContract || isSketch || isProjectStylesheet) {
        if (isProjectStylesheet) {
          const stylesheetModule = server.moduleGraph.getModuleById(RESOLVED_PROJECT_STYLESHEET_ID)
          if (stylesheetModule) server.moduleGraph.invalidateModule(stylesheetModule)
        }
        clearTimeout(fullReloadTimer)
        fullReloadTimer = setTimeout(() => {
          server.ws.send({ type: 'full-reload' })
        }, FULL_RELOAD_DELAY)
        return []
      }
    }
  }
}

export default defineConfig({
  // Le rendu public doit rester portable, y compris ouvert directement en file://.
  base: './',
  plugins: [openUIPlugin()],
  server: {
    port: 3000,
    watch: {
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 50
      },
      ignored: [
        '**/.git/**',
        '**/node_modules/**',
        '**/public/**',
        '*.html'
      ]
    }
  },
  publicDir: false,
  build: {
    // axe-core reste isolé et chargé uniquement au lancement d'un contrôle.
    chunkSizeWarningLimit: 600,
    outDir: 'public',
    emptyOutDir: true
  }
})
