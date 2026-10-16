# Design Tokens

## Intention

Les tokens sont l'etape 1 du design system : ils sont poses avant le premier atome. Ils garantissent la coherence visuelle et permettent de changer l'apparence globale sans toucher aux composants.

Un kit de depart Open UI fournit au minimum : couleurs (palette + roles), deux polices (titres et texte), echelles de texte et d'espacement, rayons, ombres, durees, et une mise en page 12 colonnes responsive (conteneur, gouttieres, grille).

## Format

Les tokens sont des variables CSS sur `:root`, avec des noms alignes sur Tailwind v4 (`--color-*`, `--font-*`, `--text-*`, `--spacing-*`, `--radius-*`, `--shadow-*`). Le meme vocabulaire sert dans les deux modes :

| Mode | Fichier source | Usage dans un composant |
|------|----------------|-------------------------|
| SCSS | `dev/assets/scss/base/_tokens.scss` | `var(--color-primary)` |
| Tailwind | bloc `@theme` du point d'entree | `bg-primary`, `text-on-primary` |

Exception : les points de rupture restent en Sass (`_breakpoints.scss`) en mode SCSS, car une variable CSS ne peut pas servir dans une media query. Memes paliers que Tailwind : `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem.

## Deux couches de couleurs

1. **Palette** : valeurs brutes (`--color-blue-600`). Elle n'est jamais utilisee directement dans un composant.
2. **Roles** : intentions UI qui pointent vers la palette (`--color-primary: var(--color-blue-600)`). Les composants n'utilisent que les roles.

Roles du kit :

| Famille | Roles |
|---------|-------|
| Texte, surfaces | `text`, `text-muted`, `surface`, `surface-muted`, `surface-disabled` |
| Bordures | `border` (separation decorative), `border-strong` (contour de controle, >= 3:1) |
| Actions | `primary`, `primary-hover`, `on-primary`, `danger`, `danger-hover`, `on-danger` |
| Liens, focus | `link`, `link-hover`, `focus` |
| Statuts | `{info,success,warning,danger}-text` et `{...}-surface` |

Changer l'identite d'un projet = modifier la palette ou rebrancher un role, sans toucher aux composants. Ajouter un role quand un besoin d'intention apparait, pas pour un cas isole.

## Contrastes garantis

Les paires de roles sont verifiees par `scripts/tokens-contrast.js` : texte/surface, `on-*`/action, `*-text`/`*-surface`, lien, bordure de controle et focus (4.5:1 pour le texte, 3:1 pour les contours et le focus).

- `npm run health` controle les tokens du projet ;
- `npm test` controle les kits de `templates/`.

Un role qui echoue bloque `health` : corriger la palette plutot que contourner dans un composant.

## Regles d'usage

- Un composant n'utilise que des roles et des echelles (`--spacing-*`, `--text-*`, `--radius-*`...).
- Pas de valeur hexadecimale ni de couleur de palette dans un composant.
- Une exception locale doit etre justifiee par l'usage et documentee ; une exception repetee devient un token ou une variante.
- Les styles inline sont interdits dans les templates Twig.

## Impact token

Modifier un token est un changement transversal. Avant, l'agent cherche ses usages (nom de variable dans `dev/assets`, et dans les Twig en mode Tailwind) et previent l'utilisateur.

```text
Token touche: --color-primary
Composants probablement impactes: button, link, focus de tous les controles
Risque: contraste du texte des boutons principaux ; relancer npm run health
```

## Questions a resoudre

- Faut-il generer un index tokens -> composants ?
- Faut-il un theme sombre (second jeu de roles sous `[data-theme="dark"]`) dans le kit ?
- Comment representer les tokens par projet quand Open UI gerera plusieurs projets ?
- Comment detecter automatiquement les valeurs hardcodees qui devraient devenir des tokens ?
