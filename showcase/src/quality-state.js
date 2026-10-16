export function countAxeNodes(results = []) {
  return results.reduce((total, result) => total + (result.nodes?.length ?? 0), 0)
}

export function normalizeAxeResults(results = []) {
  return results.map((result) => ({
    id: result.id,
    impact: result.impact ?? 'unknown',
    help: result.help,
    description: result.description,
    helpUrl: result.helpUrl,
    nodes: result.nodes.map((node) => ({
      html: node.html,
      target: node.target.map(String),
      failureSummary: node.failureSummary ?? ''
    }))
  }))
}

export function summarizeQualityReport(report) {
  if (!report) return { status: 'idle', label: 'Non testé', catalogLabel: '—' }

  if (report.w3c.status === 'pending' || report.axe.status === 'pending') {
    return { status: 'pending', label: 'Contrôle en cours', catalogLabel: '…' }
  }

  const incompleteRun = ['idle', 'error'].includes(report.w3c.status)
    || ['idle', 'error'].includes(report.axe.status)
  const htmlErrors = report.w3c.result?.errors ?? 0
  const htmlWarnings = report.w3c.result?.warnings ?? 0
  const axeViolations = countAxeNodes(report.axe.result?.violations)
  const axeIncomplete = countAxeNodes(report.axe.result?.incomplete)
  const failures = htmlErrors + axeViolations

  if (failures > 0) {
    return {
      status: 'fail',
      label: `${failures} problème${failures > 1 ? 's' : ''} automatique${failures > 1 ? 's' : ''}`,
      catalogLabel: String(failures)
    }
  }

  if (incompleteRun || htmlWarnings > 0 || axeIncomplete > 0) {
    return {
      status: 'review',
      label: incompleteRun ? 'Contrôle automatique partiel' : 'À vérifier',
      catalogLabel: '!'
    }
  }

  return {
    status: 'pass',
    label: 'Aucune erreur automatique détectée',
    catalogLabel: 'Auto OK'
  }
}
