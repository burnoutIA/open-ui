# Styles - mode SCSS

> A lire uniquement si `openui.config.json` declare `"styling": "scss"` (ou si le fichier est absent : SCSS est le mode par defaut).

## Demarrer un projet

Copier le kit de depart :

```text
templates/scss/  -> dev/assets/scss/
templates/fonts/ -> dev/assets/fonts/
```

## Fichiers

```text
dev/assets/scss/
|- style.scss                  <- point d'entree (`styleEntry`)
|- base/_tokens.scss           <- tous les tokens, en variables CSS sur :root
|- base/_breakpoints.scss      <- paliers responsive (seule valeur restee en Sass)
|- base/_mixins.scss           <- focus-ring, visually-hidden, truncate, respond-to
|- base/_fonts.scss            <- @font-face des polices auto-hebergees
|- base/_reset.scss, _typography.scss
|- layout/_container.scss      <- conteneur de page et gouttieres
|- layout/_grid.scss           <- grille 12 colonnes
|- components/_[nom].scss      <- un fichier par composant
`- components/_[nom]-page.scss <- styles propres a une page
```

Le point d'entree est configurable via `styleEntry` ; les dossiers `base/`, `layout/` et `components/` sont relatifs a son dossier.

Les `url()` (polices, images) ecrites dans un partiel sont relatives au point d'entree `style.scss`, pas au partiel : Sass ne les reecrit pas.

## Tokens

Tokens et regles generales : `docs/design-tokens.md`. En SCSS, les composants lisent les roles avec `var()` :

```scss
.btn--primary {
  color: var(--color-on-primary);
  background-color: var(--color-primary);
}
```

- jamais de couleur de palette (`--color-blue-600`) ni de valeur hexadecimale dans un composant
- espacements `var(--spacing-*)`, tailles de texte `var(--text-*)`, rayons `var(--radius-*)`, durees `var(--duration-*)`
- les points de rupture passent par le mixin `respond-to('sm' | 'md' | 'lg' | 'xl')`

## SCSS d'un composant - regles

```scss
@use '../base/mixins' as *;

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);

  &--primary { /* variante */ }
  &--sm { /* taille */ }

  &:focus-visible {
    @include focus-ring;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  @include respond-to('md') { /* elargissement */ }
}
```

Regles :
- `@use '../base/mixins' as *;` seulement si le fichier utilise un mixin
- pas de `!important` ; seule exception : le bloc `prefers-reduced-motion` du reset
- pas de selecteurs HTML nus dans les composants (`.btn` oui, `button` non)
- classes BEM strictes : `.block__element--modifier` ; le Twig applique les classes de variante
- mobile first : styles de base pour le mobile, `respond-to` pour elargir
- import manuel dans `style.scss` :

```scss
@use 'components/[nom]';
```

## Mise en page

```html
<div class="container">
  <div class="grid">
    <div class="grid__item grid__item--md-span-8">Contenu</div>
    <div class="grid__item grid__item--md-span-4">Complement</div>
  </div>
</div>
```

- `.container` : largeur max `--container-page`, gouttieres `--gutter` qui grandissent avec l'ecran
- `.grid` : 12 colonnes, espacement `--grid-gap` ; `.grid--gap-{none|sm|md|lg|xl}`, `.grid--align-*`
- `.grid__item` : 12 colonnes par defaut (empile sur mobile) ; `--span-{n}`, `--{sm|md|lg|xl}-span-{n}`, `--{md|lg}-start-{n}`
- la grille sert aux pages et aux organismes ; un atome ou une molecule ne place pas ses voisins

## Mixins

```scss
@include respond-to('md')
@include focus-ring
@include visually-hidden
@include truncate
```

## Conventions de nommage

| Element | Convention | Exemple |
|---------|-----------|---------|
| Fichier SCSS | `_kebab-case.scss` | `_form-field.scss` |
| Classes CSS | BEM `.block__element--modifier` | `.btn--primary` |
| Tokens | variables CSS `--categorie-nom` | `--color-primary`, `--spacing-md` |

## Erreurs frequentes

| Erreur | Correct |
|--------|---------|
| `color: #2563eb` ou `var(--color-blue-600)` dans un composant | `var(--color-primary)` |
| Import SCSS auto-genere | Import manuel dans `style.scss` |
| `outline: none` sans alternative | `@include focus-ring` |
| `url('../../fonts/…')` relative au partiel | `url('../fonts/…')` relative a `style.scss` |
| Style de page dans `components/_[nom].scss` | `components/_[nom]-page.scss`, ou `layout/` pour une primitive transverse |

## Verifications

- `npm run lint:scss`
- `npm run health` : SCSS composant absent, import manquant dans `style.scss`, contrastes des tokens
- `npm run snapshot -- [nom]` : captures mobile/desktop, focus clavier et Axe
- `npm run build`
