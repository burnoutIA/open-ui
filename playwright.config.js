import { defineConfig } from '@playwright/test'

// Test de bout en bout de l'outil sur le workspace courant (dev/ vide sur develop, peuplé sur workspace).
// Serveur Vite dédié sur un port à part : n'interfère pas avec un `npm run dev` ouvert.
const PORT = 4317

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '*.e2e.js',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`
  },
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/showcase/`,
    reuseExistingServer: false,
    timeout: 60_000
  }
})
