# Styles - mode SCSS

> A lire uniquement si `openui.config.json` declare `"styling": "scss"` (ou si le fichier est absent : SCSS est le mode par defaut).

## Fichiers

```text
dev/assets/scss/
|- style.scss                 <- point d'entree (`styleEntry`)
|- base/                      <- tokens, mixins, reset, typographie
|- layout/                    <- primitives transverses (grille...)
|- components/_[nom].scss     <- un fichier par composant
`- components/_[nom]-page.scss <- styles propres a une page
```

Le point d'entree est configurable via `styleEntry` ; les dossiers `components/`, `base/` et `layout/` sont relatifs a son dossier.

Le kit de depart vit dans `templates/scss/` : copier `base/` et `layout/` dans `dev/assets/scss/` au demarrage d'un projet.

## SCSS d'un composant - regles

```scss
@use '../base/variables' as *;
@use '../base/mixins' as *;

.btn {
  &--primary { /* variante */ }
  &--sm { /* taille */ }
  &--full { width: 100%; }

  &:focus-visible {
    @include focus-ring;
  }

  &:disabled,
  &[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

Regles :
- `@use '../base/variables' as *;` en tete de chaque fichier composant
- variables design system obligatoires, zero valeur hardcodee si un token existe
- pas de `!important`
- pas de selecteurs HTML nus dans les composants (`.btn` oui, `button` non)
- classes BEM strictes : `.block__element--modifier` ; le Twig applique les classes de variante
- mobile first avec `@include respond-to('md')`
- import manuel dans `style.scss` :

```scss
@use 'components/[nom]';
```

## Variables SCSS disponibles (kit de depart)

### Couleurs
```scss
$color-primary / $color-primary-light / $color-primary-dark
$color-secondary / $color-secondary-light / $color-secondary-dark
$color-success / $color-success-light / $color-success-dark
$color-danger / $color-danger-light / $color-danger-dark
$color-warning / $color-warning-light / $color-warning-dark
$color-gray-50 ... $color-gray-900
$color-white / $color-black
```

### Typographie
```scss
$font-size-xs / sm / base / lg / xl / 2xl / 3xl / 4xl
$font-weight-normal / medium / semibold / bold
$line-height-tight / normal / relaxed
$font-family-base / $font-family-mono
```

### Espacements
```scss
$spacing-xs / sm / md / lg / xl / 2xl / 3xl
```

### Autres
```scss
$radius-sm / md / lg / xl / 2xl / full
$shadow-sm / md / lg / xl
$transition-fast / base / slow
$breakpoint-sm / md / lg / xl / 2xl
$z-dropdown / sticky / fixed / modal-backdrop / modal / popover / tooltip
```

### Mixins
```scss
@include respond-to('md')
@include flex-center
@include flex-between
@include truncate
@include visually-hidden
@include focus-ring
```

## Conventions de nommage

| Element | Convention | Exemple |
|---------|-----------|---------|
| Fichier SCSS | `_kebab-case.scss` | `_form-field.scss` |
| Classes CSS | BEM `.block__element--modifier` | `.btn--primary` |
| Variables SCSS | `$categorie-nom` | `$color-primary`, `$spacing-md` |

## Erreurs frequentes

| Erreur | Correct |
|--------|---------|
| Import SCSS auto-genere | Import manuel dans `style.scss` |
| `outline: none` sans alternative | Utiliser `@include focus-ring` |
| Style de page dans `components/_[nom].scss` | `components/_[nom]-page.scss`, ou `layout/` pour une primitive transverse |

## Verifications

- `npm run lint:scss`
- `npm run health` : signale SCSS composant absent et import manquant dans `style.scss`
- `npm run build`
