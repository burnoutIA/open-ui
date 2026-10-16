# Styles - mode Tailwind

> A lire uniquement si `openui.config.json` declare `"styling": "tailwind"`.

## Demarrer un projet

Copier le kit de depart :

```text
templates/tailwind/style.css -> dev/assets/css/style.css
templates/fonts/             -> dev/assets/fonts/
```

## Fichiers

```text
dev/assets/css/style.css   <- point d'entree (`styleEntry`) : import Tailwind, sources, polices, tokens, base
```

Pas de feuille par composant : les styles vivent dans les classes utilitaires du Twig.

Les `@source "../../components"` et `"../../pages"` sont explicites : Tailwind ignore sinon les dossiers exclus par `.gitignore`.

## Tokens

Tokens et regles generales : `docs/design-tokens.md`. Memes noms qu'en mode SCSS, declares dans `@theme` :

- la palette Tailwind par defaut est retiree (`--color-*: initial`) : seules la palette du projet et les roles existent ;
- un composant utilise les roles : `bg-primary text-on-primary`, `text-text-muted`, `border-border-strong`, `bg-success-surface text-success-text` ;
- espacements nommes `p-md`, `gap-sm` (ou l'echelle numerique Tailwind), polices `font-heading` / `font-body` ;
- pas de valeur arbitraire si un token existe : `bg-primary` oui, `bg-[#2563eb]` non ; une valeur arbitraire repetee devient un token ;
- modifier `@theme` est un changement transversal : l'annoncer et relancer `npm run health` (contrastes).

## Mise en page

```html
<div class="container-page">
  <div class="grid grid-cols-12 gap-(--grid-gap)">
    <div class="col-span-12 md:col-span-8">Contenu</div>
    <div class="col-span-12 md:col-span-4">Complement</div>
  </div>
</div>
```

- `container-page` : utilitaire du kit, largeur max `--container-page`, gouttieres `--gutter` responsives
- grille : utilitaires Tailwind natifs, 12 colonnes, `col-span-12` par defaut puis `md:` / `lg:` pour elargir
- la grille sert aux pages et aux organismes ; un atome ou une molecule ne place pas ses voisins

## Variantes d'un composant - regles

Tailwind ne genere que les classes ecrites en entier dans les sources. Chaque variante declaree dans le JSON correspond donc a une table de classes completes, en tete du Twig :

```twig
{% set variant = variant|default('primary') %}
{% set size    = size|default('md') %}
{% set text    = text|default('Cliquez ici') %}

{% set variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-surface text-text border border-border-strong hover:bg-surface-muted'
} %}
{% set sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base'
} %}

<button
  type="button"
  class="inline-flex items-center rounded-md font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-50 {{ variants[variant] }} {{ sizes[size] }}"
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
| `class="text-{{ tone }}"` | Table `{ info: 'text-info-text bg-info-surface', ... }` en tete du Twig |
| `bg-[#2563eb]` ou `bg-blue-600` | Role : `bg-primary` |
| Prop `class` qui ajoute `p-2` sur un composant en `p-4` | Variante declaree dans le JSON |
| `outline-none` seul | `focus-visible:outline-2 focus-visible:outline-focus` |

## Verifications

- `npm run lint:scss` ne s'applique pas
- `npm run health` saute les controles SCSS et verifie les contrastes des roles de `@theme`
- `npm run snapshot -- [nom]` : captures mobile/desktop, focus clavier et Axe
- `npm run build`, puis verifier dans le Showcase chaque option de variante
