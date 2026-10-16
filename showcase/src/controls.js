const CONTROL_GROUPS = [
  { key: 'variants', label: 'Variantes' },
  { key: 'content', label: 'Contenu' }
]

const RELATION_GROUPS = [
  { key: 'parts', label: 'Parts' },
  { key: 'collections', label: 'Collections' },
  { key: 'families', label: 'Familles' },
  { key: 'instances', label: 'Instances' },
  { key: 'layoutGroups', label: 'Groupes de layout' }
]

export function getComponentDefaults(component) {
  const defaults = {}

  for (const group of CONTROL_GROUPS) {
    for (const [key, control] of Object.entries(component[group.key] ?? {})) {
      defaults[key] = cloneValue(control.default)
    }
  }

  return defaults
}

export function renderControls(container, component, values, onChange) {
  container.replaceChildren()

  for (const group of CONTROL_GROUPS) {
    const controls = Object.entries(component[group.key] ?? {})
    if (!controls.length) continue

    const fieldset = document.createElement('fieldset')
    fieldset.className = 'control-group'

    const legend = document.createElement('legend')
    legend.textContent = group.label
    fieldset.append(legend)

    for (const [key, control] of controls) {
      fieldset.append(createControl(group.key, key, control, values[key], onChange))
    }

    container.append(fieldset)
  }
}

export function renderComposition(container, component) {
  container.replaceChildren()
  const availableGroups = RELATION_GROUPS
    .map((group) => ({ ...group, entries: Object.entries(component[group.key] ?? {}) }))
    .filter((group) => group.entries.length)

  if (!availableGroups.length) return

  const section = document.createElement('section')
  section.className = 'composition'
  section.setAttribute('aria-labelledby', 'composition-title')

  const title = document.createElement('h3')
  title.className = 'composition__title'
  title.id = 'composition-title'
  title.textContent = 'Composition'
  section.append(title)

  for (const group of availableGroups) {
    const details = document.createElement('details')
    details.className = 'relation-group'

    const summary = document.createElement('summary')
    summary.textContent = `${group.label} · ${group.entries.length}`
    details.append(summary)

    const list = document.createElement('ul')
    list.className = 'relation-list'

    for (const [key, relation] of group.entries) {
      list.append(createRelationCard(key, relation))
    }

    details.append(list)
    section.append(details)
  }

  container.append(section)
}

function createControl(groupName, key, control, value, onChange) {
  const id = `control-${safeId(groupName)}-${safeId(key)}`

  if (control.type === 'checkbox') {
    const wrapper = document.createElement('div')
    wrapper.className = 'control control--checkbox'

    const input = document.createElement('input')
    input.id = id
    input.name = key
    input.type = 'checkbox'
    input.checked = Boolean(value)
    input.addEventListener('change', () => onChange(key, input.checked, control))

    const label = document.createElement('label')
    label.htmlFor = id
    label.textContent = control.label ?? key

    const meta = document.createElement('span')
    meta.className = 'control__key'
    meta.textContent = key

    wrapper.append(input, label, meta)
    return wrapper
  }

  const wrapper = document.createElement('div')
  wrapper.className = 'control'

  const labelRow = document.createElement('div')
  labelRow.className = 'control__label-row'

  const label = document.createElement(control.type === 'array' ? 'p' : 'label')
  label.className = 'control__label'
  if (control.type === 'array') label.id = `${id}-label`
  else label.htmlFor = id
  label.textContent = control.label ?? key

  const meta = document.createElement('span')
  meta.className = 'control__type'
  meta.textContent = `${key} · ${control.type}`
  labelRow.append(label, meta)
  wrapper.append(labelRow)

  if (control.type === 'select') {
    wrapper.append(createSelect(id, key, control, value, onChange))
    return wrapper
  }

  if (control.type === 'number') {
    wrapper.append(createNumber(id, key, control, value, onChange))
    return wrapper
  }

  if (control.type === 'color') {
    wrapper.append(createColor(id, key, control, value, onChange))
    return wrapper
  }

  if (control.type === 'array') {
    wrapper.append(createArrayEditor(id, key, control, value, onChange, label.id))
    return wrapper
  }

  if (control.type === 'component-params') {
    wrapper.append(createJsonEditor(id, key, control, value, onChange))
    return wrapper
  }

  wrapper.append(createText(id, key, value, onChange, control))
  return wrapper
}

function createSelect(id, key, control, value, onChange) {
  const select = document.createElement('select')
  select.id = id
  select.name = key

  for (const optionValue of control.options ?? []) {
    const option = document.createElement('option')
    option.value = String(optionValue)
    option.textContent = String(optionValue)
    option.selected = optionValue === value
    select.append(option)
  }

  select.addEventListener('change', () => {
    const selected = (control.options ?? []).find((option) => String(option) === select.value)
    onChange(key, selected ?? select.value, control)
  })
  return select
}

function createNumber(id, key, control, value, onChange) {
  const input = document.createElement('input')
  input.id = id
  input.name = key
  input.type = 'number'
  input.value = Number.isFinite(Number(value)) ? String(value) : ''

  for (const attribute of ['min', 'max', 'step']) {
    if (Object.hasOwn(control, attribute)) input.setAttribute(attribute, control[attribute])
  }

  input.addEventListener('input', () => {
    if (input.validity.valid && input.value !== '') onChange(key, input.valueAsNumber, control)
  })
  return input
}

function createText(id, key, value, onChange, control) {
  const input = document.createElement('input')
  input.id = id
  input.name = key
  input.type = 'text'
  input.value = value == null ? '' : String(value)
  input.addEventListener('input', () => onChange(key, input.value, control))
  return input
}

function createColor(id, key, control, value, onChange) {
  const row = document.createElement('div')
  row.className = 'color-control'

  const picker = document.createElement('input')
  picker.type = 'color'
  picker.value = normalizeHexColor(value)
  picker.setAttribute('aria-label', `Choisir ${control.label ?? key}`)

  const text = document.createElement('input')
  text.id = id
  text.name = key
  text.type = 'text'
  text.value = value == null ? '' : String(value)

  picker.addEventListener('input', () => {
    text.value = picker.value
    onChange(key, picker.value, control)
  })

  text.addEventListener('input', () => {
    if (/^#[0-9a-f]{6}$/i.test(text.value)) picker.value = text.value
    onChange(key, text.value, control)
  })

  row.append(picker, text)
  return row
}

export function resolveArrayItemSchema(control, value = []) {
  if (isPlainObject(control.item)) {
    const hasFields = isPlainObject(control.item.fields) && Object.keys(control.item.fields).length > 0
    if (hasFields || typeof control.item.type === 'string') return cloneValue(control.item)
  }

  const candidates = [
    ...(Array.isArray(value) ? value : []),
    ...(Array.isArray(control.default) ? control.default : [])
  ]
  const objectCandidates = candidates.filter(isPlainObject)

  if (objectCandidates.length) {
    const fieldKeys = new Set(objectCandidates.flatMap((item) => Object.keys(item)))
    return {
      label: 'Élément',
      fields: Object.fromEntries([...fieldKeys].map((fieldKey) => {
        const sample = objectCandidates.find((item) => Object.hasOwn(item, fieldKey))?.[fieldKey]
        return [fieldKey, inferControlFromValue(fieldKey, sample)]
      }))
    }
  }

  const scalarSample = candidates.find((item) => ['string', 'number', 'boolean'].includes(typeof item))
  if (scalarSample !== undefined) {
    return {
      label: 'Élément',
      ...inferControlFromValue('item', scalarSample)
    }
  }

  return null
}

export function createArrayItemDefault(itemSchema) {
  if (isPlainObject(itemSchema.fields)) {
    return Object.fromEntries(Object.entries(itemSchema.fields).map(([fieldKey, fieldControl]) => [
      fieldKey,
      defaultControlValue(fieldControl)
    ]))
  }

  return defaultControlValue(itemSchema)
}

function createArrayEditor(id, key, control, value, onChange, labelId) {
  const itemSchema = resolveArrayItemSchema(control, value)

  if (!itemSchema) {
    const fallback = document.createElement('div')
    fallback.className = 'array-editor array-editor--fallback'

    const note = document.createElement('p')
    note.className = 'array-editor__note'
    note.textContent = 'Ajoutez un schéma item au contrôle pour obtenir une édition guidée.'

    fallback.append(note, createJsonEditor(id, key, control, value, onChange, labelId))
    return fallback
  }

  const editor = document.createElement('div')
  editor.className = 'array-editor'
  editor.setAttribute('role', 'group')
  editor.setAttribute('aria-labelledby', labelId)

  const toolbar = document.createElement('div')
  toolbar.className = 'array-editor__toolbar'

  const count = document.createElement('p')
  count.className = 'array-editor__count'
  count.setAttribute('aria-live', 'polite')

  const addButton = document.createElement('button')
  addButton.className = 'array-editor__add'
  addButton.type = 'button'
  addButton.textContent = itemSchema.addLabel ?? control.addLabel ?? 'Ajouter un élément'

  const list = document.createElement('ol')
  list.className = 'array-editor__list'

  const empty = document.createElement('p')
  empty.className = 'array-editor__empty'
  empty.textContent = 'Aucun élément pour le moment.'

  let items = Array.isArray(value) ? cloneValue(value) : []

  addButton.addEventListener('click', () => {
    items.push(createArrayItemDefault(itemSchema))
    renderItems(items.length - 1)
    commit()
  })

  function commit() {
    onChange(key, cloneValue(items), control)
  }

  function renderItems(focusIndex = null) {
    list.replaceChildren()
    count.textContent = formatItemCount(items.length)
    empty.hidden = items.length > 0

    items.forEach((itemValue, index) => {
      list.append(createArrayItem({
        baseId: id,
        key,
        index,
        itemSchema,
        value: itemValue,
        onFieldChange(fieldKey, nextValue) {
          if (isPlainObject(itemSchema.fields)) {
            const currentItem = isPlainObject(items[index]) ? items[index] : {}
            currentItem[fieldKey] = nextValue
            items[index] = currentItem
          } else {
            items[index] = nextValue
          }
          commit()
        },
        onRemove() {
          items.splice(index, 1)
          const nextFocusIndex = Math.min(index, items.length - 1)
          renderItems(nextFocusIndex >= 0 ? nextFocusIndex : null)
          commit()
          if (!items.length) queueMicrotask(() => addButton.focus())
        }
      }))
    })

    if (focusIndex !== null) {
      queueMicrotask(() => {
        list.querySelector(`[data-item-index="${focusIndex}"] input, [data-item-index="${focusIndex}"] select`)?.focus()
      })
    }
  }

  toolbar.append(count, addButton)
  editor.append(toolbar, empty, list)
  renderItems()
  return editor
}

function createArrayItem({ baseId, key, index, itemSchema, value, onFieldChange, onRemove }) {
  const item = document.createElement('li')
  item.className = 'array-item'
  item.dataset.itemIndex = String(index)

  const fieldset = document.createElement('fieldset')
  fieldset.className = 'array-item__fieldset'

  const legend = document.createElement('legend')
  legend.className = 'array-item__legend'
  legend.textContent = `${itemSchema.label ?? 'Élément'} ${index + 1}`

  const fields = document.createElement('div')
  fields.className = 'array-item__fields'

  if (isPlainObject(itemSchema.fields)) {
    for (const [fieldKey, fieldControl] of Object.entries(itemSchema.fields)) {
      const fieldValue = isPlainObject(value) && Object.hasOwn(value, fieldKey)
        ? value[fieldKey]
        : defaultControlValue(fieldControl)
      fields.append(createArrayField(
        `${baseId}-${index}-${safeId(fieldKey)}`,
        `${key}[${index}][${fieldKey}]`,
        fieldKey,
        fieldControl,
        fieldValue,
        (nextValue) => onFieldChange(fieldKey, nextValue)
      ))
    }
  } else {
    fields.append(createArrayField(
      `${baseId}-${index}`,
      `${key}[${index}]`,
      'item',
      itemSchema,
      value,
      (nextValue) => onFieldChange('item', nextValue)
    ))
  }

  const removeButton = document.createElement('button')
  removeButton.className = 'array-item__remove'
  removeButton.type = 'button'
  removeButton.textContent = 'Supprimer'
  removeButton.setAttribute('aria-label', `Supprimer ${itemSchema.label?.toLocaleLowerCase('fr') ?? 'élément'} ${index + 1}`)
  removeButton.addEventListener('click', onRemove)

  fieldset.append(legend, fields, removeButton)
  item.append(fieldset)
  return item
}

function createArrayField(id, name, fieldKey, fieldControl, value, onChange) {
  const wrapper = document.createElement('div')
  wrapper.className = 'array-item__field'

  if (fieldControl.type === 'checkbox') {
    wrapper.classList.add('array-item__field--checkbox')
    const input = document.createElement('input')
    input.id = id
    input.name = name
    input.type = 'checkbox'
    input.checked = Boolean(value)
    input.addEventListener('change', () => onChange(input.checked))

    const label = document.createElement('label')
    label.htmlFor = id
    label.textContent = fieldControl.label ?? fieldKey
    wrapper.append(input, label)
    return wrapper
  }

  const label = document.createElement('label')
  label.htmlFor = id
  label.textContent = fieldControl.label ?? fieldKey
  wrapper.append(label)

  const forwardChange = (_key, nextValue) => onChange(nextValue)
  if (fieldControl.type === 'select') wrapper.append(createSelect(id, name, fieldControl, value, forwardChange))
  else if (fieldControl.type === 'number') wrapper.append(createNumber(id, name, fieldControl, value, forwardChange))
  else if (fieldControl.type === 'color') wrapper.append(createColor(id, name, fieldControl, value, forwardChange))
  else wrapper.append(createText(id, name, value, forwardChange, fieldControl))

  return wrapper
}

function createJsonEditor(id, key, control, value, onChange, labelId = '') {
  const fragment = document.createDocumentFragment()
  const errorId = `${id}-error`

  const textarea = document.createElement('textarea')
  textarea.id = id
  textarea.name = key
  textarea.spellcheck = false
  textarea.value = JSON.stringify(value ?? (control.type === 'array' ? [] : {}), null, 2)
  textarea.setAttribute('aria-describedby', errorId)
  if (labelId) textarea.setAttribute('aria-labelledby', labelId)

  const error = document.createElement('p')
  error.className = 'control__error'
  error.id = errorId
  error.hidden = true

  textarea.addEventListener('input', () => {
    try {
      const parsed = JSON.parse(textarea.value)
      const validShape = control.type === 'array'
        ? Array.isArray(parsed)
        : parsed && typeof parsed === 'object' && !Array.isArray(parsed)

      if (!validShape) throw new Error(control.type === 'array' ? 'Une liste JSON est attendue.' : 'Un objet JSON est attendu.')

      textarea.removeAttribute('aria-invalid')
      error.hidden = true
      error.textContent = ''
      onChange(key, parsed, control)
    } catch (parseError) {
      textarea.setAttribute('aria-invalid', 'true')
      error.hidden = false
      error.textContent = parseError.message
    }
  })

  fragment.append(textarea, error)
  return fragment
}

function inferControlFromValue(key, value) {
  if (typeof value === 'boolean') return { label: key, type: 'checkbox', default: false }
  if (typeof value === 'number') return { label: key, type: 'number', default: 0 }
  return { label: key, type: 'text', default: '' }
}

function defaultControlValue(control) {
  if (Object.hasOwn(control, 'default')) return cloneValue(control.default)
  if (control.type === 'checkbox') return false
  if (control.type === 'number') return 0
  if (control.type === 'select') return cloneValue(control.options?.[0] ?? '')
  return ''
}

function formatItemCount(count) {
  if (count === 0) return 'Aucun élément'
  return `${count} ${count === 1 ? 'élément' : 'éléments'}`
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function createRelationCard(key, relation) {
  const item = document.createElement('li')
  item.className = 'relation-card'

  const title = document.createElement('p')
  title.className = 'relation-card__title'
  title.textContent = relation.label ?? key

  const reference = relation.component ?? relation.itemComponent ?? 'structure locale'
  const descriptors = [reference, relation.mode, relation.kind].filter(Boolean)
  const meta = document.createElement('p')
  meta.className = 'relation-card__meta'
  meta.textContent = `${key} · ${descriptors.join(' · ')}`

  const details = document.createElement('details')
  const summary = document.createElement('summary')
  summary.textContent = 'Voir le contrat JSON'
  const pre = document.createElement('pre')
  pre.textContent = JSON.stringify(relation, null, 2)
  details.append(summary, pre)

  item.append(title, meta, details)
  return item
}

function normalizeHexColor(value) {
  const stringValue = value == null ? '' : String(value)
  if (/^#[0-9a-f]{6}$/i.test(stringValue)) return stringValue
  if (/^#[0-9a-f]{3}$/i.test(stringValue)) {
    return `#${stringValue.slice(1).split('').map((character) => character.repeat(2)).join('')}`
  }
  return '#000000'
}

function safeId(value) {
  return String(value).replace(/[^a-z0-9_-]/gi, '-').toLowerCase()
}

function cloneValue(value) {
  if (value === undefined) return ''
  return structuredClone(value)
}
