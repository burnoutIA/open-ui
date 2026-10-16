import { describe, expect, it } from 'vitest'
import { createArrayItemDefault, getComponentDefaults, resolveArrayItemSchema } from './controls.js'

describe('array controls', () => {
  it('utilise le schéma item explicite pour une liste vide', () => {
    const control = {
      type: 'array',
      default: [],
      item: {
        label: 'Lien',
        fields: {
          text: { label: 'Libellé', type: 'text', default: 'Nouveau lien' },
          href: { label: 'Destination', type: 'text', default: '#' },
          current: { label: 'Page courante', type: 'checkbox', default: false }
        }
      }
    }

    const schema = resolveArrayItemSchema(control, [])
    expect(schema.label).toBe('Lien')
    expect(createArrayItemDefault(schema)).toEqual({
      text: 'Nouveau lien',
      href: '#',
      current: false
    })
  })

  it('déduit les champs depuis une liste existante sans schéma', () => {
    const schema = resolveArrayItemSchema({ type: 'array', default: [] }, [
      { name: 'Premier', enabled: true, order: 1 }
    ])

    expect(schema.fields).toEqual({
      name: { label: 'name', type: 'text', default: '' },
      enabled: { label: 'enabled', type: 'checkbox', default: false },
      order: { label: 'order', type: 'number', default: 0 }
    })
  })

  it('conserve le repli JSON pour une liste vide dont la forme est inconnue', () => {
    expect(resolveArrayItemSchema({ type: 'array', default: [] }, [])).toBeNull()
  })
})

describe('valeurs de départ du Showcase', () => {
  it('remplace les défauts par preview, seulement pour les props déclarées', () => {
    const component = {
      variants: { tone: { type: 'select', default: 'info', options: ['info', 'danger'] } },
      content: { errors: { type: 'array', default: [] } },
      preview: { errors: [{ field: 'email', message: 'Erreur' }] }
    }
    expect(getComponentDefaults(component)).toEqual({ tone: 'info', errors: [{ field: 'email', message: 'Erreur' }] })
  })
})
