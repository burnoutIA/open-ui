import fs from 'fs'
import { getComponentEntries, getPageEntries } from '../../scripts/design-system.js'

const CONTROL_GROUPS = ['variants', 'content']

export function getShowcaseCatalog(sources = {}) {
  const components = sources.components ?? getComponentEntries()
  const pages = sources.pages ?? getPageEntries()

  return [
    ...components.map((component) => createCatalogEntry(component, 'component')),
    ...pages.map((page) => createCatalogEntry(page, 'page'))
  ]
}

export function getShowcaseComponent(componentId, components = getComponentEntries()) {
  return components.find((component) => component.id === componentId) ?? null
}

export function getShowcaseEntry(entryType, entryId, sources = {}) {
  const entries = entryType === 'page'
    ? sources.pages ?? getPageEntries()
    : entryType === 'component'
      ? sources.components ?? getComponentEntries()
      : []

  return entries.find((entry) => entry.id === entryId) ?? null
}

export function normalizeShowcaseProps(schema, submittedProps = {}) {
  return normalizeComponentProps(schema, submittedProps)
}

export function normalizeComponentProps(schema, submittedProps = {}) {
  const safeProps = submittedProps && typeof submittedProps === 'object' && !Array.isArray(submittedProps)
    ? submittedProps
    : {}
  const normalized = {}

  for (const groupName of CONTROL_GROUPS) {
    for (const [key, control] of Object.entries(schema[groupName] ?? {})) {
      const submitted = Object.hasOwn(safeProps, key)
        ? safeProps[key]
        : control.default

      normalized[key] = normalizeControlValue(control, submitted)
    }
  }

  return normalized
}

function normalizeControlValue(control, value) {
  if (control.type === 'checkbox') return Boolean(value)

  if (control.type === 'number') {
    const number = Number(value)
    return Number.isFinite(number) ? number : Number(control.default ?? 0)
  }

  if (control.type === 'select') {
    return Array.isArray(control.options) && control.options.includes(value)
      ? value
      : control.default
  }

  if (control.type === 'array') {
    const items = Array.isArray(value) ? value : structuredClone(control.default ?? [])
    return control.item ? items.map((item) => normalizeArrayItem(control.item, item)) : items
  }

  if (control.type === 'component-params') {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : structuredClone(control.default ?? {})
  }

  return value == null ? '' : String(value)
}

function normalizeArrayItem(itemSchema, value) {
  if (itemSchema.fields && typeof itemSchema.fields === 'object' && !Array.isArray(itemSchema.fields)) {
    const safeValue = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    return Object.fromEntries(Object.entries(itemSchema.fields).map(([fieldKey, fieldControl]) => {
      const fieldValue = Object.hasOwn(safeValue, fieldKey)
        ? safeValue[fieldKey]
        : fieldControl.default
      return [fieldKey, normalizeControlValue(fieldControl, fieldValue)]
    }))
  }

  return normalizeControlValue(itemSchema, value)
}

function createCatalogEntry(entry, type) {
  return {
    ...entry.schema,
    id: entry.id,
    key: `${type}:${entry.id}`,
    type,
    level: type === 'page' ? 'page' : entry.schema.level,
    documentation: entry.mdPath && fs.existsSync(entry.mdPath)
      ? fs.readFileSync(entry.mdPath, 'utf8')
      : ''
  }
}
