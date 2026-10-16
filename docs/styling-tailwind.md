# Styles - mode Tailwind

> A lire uniquement si `openui.config.json` declare `"styling": "tailwind"`.

## Fichiers

```text
dev/assets/css/style.css   <- point d'entree (`styleEntry`) : import Tailwind, sources, tokens
```

Pas de feuille par composant : les styles vivent dans les classes utilitaires du Twig.

Le kit de depart est `templates/tailwind/style.css` : le copier dans `dev/assets/css/style.css` au demarrage d'un projet.

```css
@import "tailwindcss";
@source "../../components";
@source "../../pages";

@theme {
  --color-primary: #2563eb;
}
```

Les `@source` sont explicites : Tailwind ignore sinon les dossiers exclus par `.gitignore`.

## Tokens

- Les tokens vivent dans `@theme` (`--color-*`, `--spacing-*`, `--radius-*`, `--font-*`...) et deviennent des utilitaires (`bg-primary`, `rounded-lg`...).
- Utiliser un token plutot qu'une valeur arbitraire : `bg-primary` oui, `bg-[#2563eb]` non.
- Une valeur arbitraire `[...]` repetee doit devenir un token.
- Modifier `@theme` est un changement transversal : l'annoncer comme pour un token SCSS.

## Variantes d'un composant - regles

Tailwind ne genere que les classes ecrites en entier dans les sources. Chaque variante declaree dans le JSON correspond donc a une table de classes completes, en tete du Twig :

```twig
{% set variant = variant|default('primary') %}
{% set size    = size|default('md') %}
{% set text    = text|default('Cliquez ici') %}

{% set variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50'
} %}
{% set sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base'
} %}

<button
  type="button"
  class="inline-flex items-center rounded-md font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 {{ variants[variant] }} {{ sizes[size] }}"
>
  {{ text }}
</button>
```

Regles :
- jamais de nom de classe construit : `bg-{{ color }}-500` ne sera pas genere
- une table de classes par controle `select` du JSON, cles identiques aux `options`
- ces tables sont la seule logique de presentation autorisee dans le Twig
- pas de prop `class` libre pour surcharger des utilitaires : `p-4` et `p-2` ensemble donnent un resultat imprevisible ; ajouter une variante declaree a la place
- un motif de classes repete dans plusieurs composants devient un composant ou une variante, pas un `@apply`
- `@apply` reserve aux cas documentes ou le HTML n'est pas maitrise (contenu riche injecte)
- pas de `!important` (`!` en Tailwind)
- mobile first : utilitaires sans prefixe pour le mobile, `md:`, `lg:`... pour elargir

## Accessibilite

- focus visible avec `focus-visible:` ; jamais `outline-none` sans alternative
- etats desactives : `disabled:` et `aria-disabled:` en plus des attributs
- texte masque visuellement : `sr-only`

## Erreurs frequentes

| Erreur | Correct |
|--------|---------|
| `class="text-{{ tone }}"` | Table `{ info: 'text-blue-700', ... }` en tete du Twig |
| `bg-[#2563eb]` | Token `@theme` puis `bg-primary` |
| Prop `class` qui ajoute `p-2` sur un composant en `p-4` | Variante declaree dans le JSON |
| `outline-none` seul | `focus-visible:outline-2 focus-visible:outline-primary` |

## Verifications

- `npm run lint:scss` ne s'applique pas
- `npm run health` saute les controles SCSS
- `npm run build`, puis verifier dans le Showcase chaque option de variante
