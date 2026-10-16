# GUIDELINES_AI.md - Open UI

> Document universel. Toute IA qui lit ce fichier doit pouvoir creer un composant conforme sans autre explication.
>
> Les contrats detailles du projet vivent aussi dans `docs/` : modele composant, analyse d'impact, workflow agent, tokens, multi-projets, esquisses et modes de style.

---

## 1. Hierarchie Atomic Design

| Niveau | `level` JSON | Emplacement | Description |
|--------|--------------|-------------|-------------|
| **Atom** | `"atom"` | `dev/components/[nom]/` | Element UI indivisible : bouton, input, badge, icone, label |
| **Molecule** | `"molecule"` | `dev/components/[nom]/` | Composition d'atoms : champ de formulaire, carte, tag group |
| **Organism** | `"organism"` | `dev/components/[nom]/` | Composition de molecules : header, formulaire complet, nav |
| **Template** | `"template"` | `dev/components/[nom]/` | Structure de page avec zones de contenu, sans contenu reel |
| **Page** | `"page"` ou page JSON sans `level` | `dev/pages/` | Instance d'un template avec contenu reel. JSON optionnel pour exposer des controles dans l’espace de travail. |

Regle fondamentale : la composition est toujours descendante. Un atom n'inclut jamais une molecule. Un organism n'inclut jamais un template.

---

## 2. Structure d'un composant

Chaque composant `[nom]` en `kebab-case` vit dans `dev/components/` :

```text
dev/components/[nom]/
|- [nom].json   <- Source de verite : metadonnees + controles de l’espace de travail
|- [nom].twig   <- Template de rendu
|- [nom].md     <- Documentation obligatoire
`- [nom].js     <- Comportement, seulement si le composant est interactif
```

Script d'un composant (`[nom].js`), s'il en faut un :
- module ES sans export ni initialisation : il ecoute au niveau de `document` (delegation d'evenements), ce qui le rend actif sur une page comme dans le Showcase, et sur du HTML ajoute plus tard
- le composant cible ses elements par des attributs `data-[nom]-*`, jamais par ses classes de style
- amelioration progressive : sans JavaScript, le contenu reste accessible (ex. navigation affichee en liste)
- import manuel dans le point d'entree JS du projet (`scriptEntry`, par defaut `dev/assets/js/main.js`) : `import '../../components/[nom]/[nom].js'` ; `npm run health` signale un import manquant
- une page charge ce point d'entree : `<script type="module" src="/dev/assets/js/main.js"></script>`

Structure imposee pour `[nom].md` :

```markdown
# [Nom du composant]

## Usage
[Quand et pourquoi utiliser ce composant.]

## Props

| Prop | Type | Defaut | Description |
|------|------|--------|-------------|
| `prop` | `string` | `'valeur'` | Description de la prop |

## Accessibilite
[Attributs ARIA, comportement clavier, points d'attention.]

## Responsive
[Ajouter cette section si le composant a une reorganisation, une contrainte de contenu ou un comportement responsive non evident.]

## Exemples

### Exemple de base
```twig
{% include 'dev/components/[nom]/[nom].twig' with {
  prop: 'valeur'
} %}
```

### Variante [nom]
```twig
{% include 'dev/components/[nom]/[nom].twig' with {
  variant: 'nom-variante'
} %}
```
```

Styles associes : selon le mode declare dans `openui.config.json` (voir section 5).

---

## 3. JSON d'un composant - structure complete

Exemple minimal valide :

```json
{
  "name": "Button",
  "status": "in-progress",
  "level": "atom",
  "category": "Forms",
  "description": "Element d'action interactif.",
  "variants": {
    "variant": {
      "label": "Variante",
      "type": "select",
      "default": "primary",
      "options": ["primary", "secondary", "outline"]
    }
  },
  "content": {
    "text": {
      "label": "Texte",
      "type": "text",
      "default": "Cliquez ici"
    }
  },
  "parts": {},
  "collections": {}
}
```

Champs obligatoires :
- `name`
- `level` pour les composants dans `dev/components/`
- `category`
- `description`

Statut de travail :
- `status` accepte `todo`, `in-progress` ou `done`
- l'absence de `status` vaut `done` pour compatibilite
- declarer `in-progress` des le debut d'une creation ou refonte, puis `done` seulement apres validation, verification visuelle, responsive et accessibilite pertinentes
- `.openui/graph.json` agrege les statuts et les relations ; ne pas l'editer a la main

Types de controles disponibles :
- `select` -> `{ type, label, default, options: [] }`
- `checkbox` -> `{ type, label, default: boolean }`
- `text` -> `{ type, label, default: string }`
- `color` -> `{ type, label, default: "#hexcode" }`
- `number` -> `{ type, label, default: number }`

Semantique :
- `variants` = apparence, etats, options visuelles
- `content` = texte, libelles, contenu editorial ou donnees affichees

### JSON v2 : `parts`

`parts` reference un sous-composant unique editable sans dupliquer son JSON canonique.

```json
{
  "parts": {
    "cta": {
      "label": "CTA",
      "component": "button",
      "mode": "single",
      "autoBind": true
    }
  }
}
```

Champs supportes :
- `label` : libelle affiche dans l’inspecteur agentique
- `component` : id du composant canonique reference
- `mode` : `single` uniquement pour l'instant
- `binding` : mapping explicite enfant -> parent
- `autoBind` : mapping automatique par convention de nommage
- `exclude` : retire certains champs de l'autobind
- `defaults` : valeurs locales figees ou initialisees

### JSON v2 : `collections`

`collections` modelise une structure repetitive. Le comportement bulk ne doit pas etre deduit automatiquement: il doit etre annonce explicitement comme une vraie liste.

```json
{
  "collections": {
    "articles": {
      "label": "Cards listing",
      "kind": "list",
      "itemComponent": "card",
      "mode": "bulk",
      "autoBind": true,
      "exclude": {
        "variants": ["horizontal"],
        "content": ["title", "text"]
      }
    }
  }
}
```

Champs supportes :
- `label` : libelle affiche dans l’inspecteur agentique
- `kind` : type semantique de repetition. Utiliser `list` pour une vraie liste editable en bulk
- `itemComponent` : composant canonique de chaque item
- `mode` : `bulk` uniquement pour l'instant
- `binding` / `autoBind` / `exclude` : meme logique que pour `parts`

### Regle de bulk explicite

- une repetition de composants n'est pas automatiquement une liste
- pour ouvrir un vrai tiroir bulk de famille, le JSON doit declarer explicitement `kind: "list"`
- sans `kind: "list"`, une repetition doit etre modelisee autrement : instances individuelles, groupes de layout, ou autre structure plus fine
- cas typique de `list` : liste de `card`, listing d'articles, grille de produits, menu repetitif
- cas non-`list` typique : page de formulaire avec plusieurs `input`, `checkbox`, `switch`, ou `button`

### Regle de source de verite

- Le composant enfant reste defini dans son propre JSON canonique.
- Le parent ne copie jamais le schema complet de l'enfant.
- Le parent expose seulement les champs plats necessaires pour piloter l'enfant.

### Convention `autoBind`

Quand `autoBind: true`, le moteur cherche automatiquement les champs parent via une convention plate :

- prefixe = identifiant du `part` ou de la `collection`
- suffixe = nom du champ enfant avec premiere lettre capitalisee

Exemples :
- `parts.cta` + `button.variant` -> `ctaVariant`
- `parts.cta` + `button.text` -> `ctaText`
- `parts.header` + `header-nav.ctaSize` -> `headerCtaSize`
- `parts.footer` + `footer.copyright` -> `footerCopyright`
- `collections.articles` + `card.hasImage` -> `articlesHasImage` si ce champ existe

### Quand utiliser `binding`

Utiliser un `binding` explicite si :
- le parent ne suit pas la convention `autoBind`
- le parent doit re-utiliser un champ deja existant
- le parent doit adapter une semantique specifique

Exemple :

```json
{
  "parts": {
    "cta": {
      "label": "CTA",
      "component": "button",
      "mode": "single",
      "binding": {
        "variants": {
          "variant": "primaryActionVariant"
        },
        "content": {
          "text": "primaryActionLabel"
        }
      }
    }
  }
}
```

### Quand utiliser `exclude`

Utiliser `exclude` pour ne pas exposer automatiquement certains champs enfant.

Cas typiques :
- une collection de `card` ne doit pas bulk-editer `title` ou `text`
- un parent veut figer `horizontal`
- un champ existe techniquement mais n'a pas d'interet produit dans l’inspecteur agentique

### Regles d'usage JSON v2

- `parts` pour un sous-composant unique : CTA, header, footer, media block
- `collections` uniquement pour une repetition explicitement declaree, idealement avec `kind: "list"`
- une repetition visuelle seule ne suffit pas pour declarer une `collection`
- les vraies listes (`kind: "list"`) sont editees en bulk par defaut
- ne pas introduire de recursivite arbitrairement profonde sans besoin valide

### JSON v2+ : repetition non-`list`

Quand une page repete plusieurs composants sans etre une vraie liste editoriale, ne pas utiliser `collections`.
Utiliser a la place trois noeuds complementaires :

- `families` : reglage partage par type de composant repete
- `instances` : occurrence individuelle editable
- `layoutGroups` : structure de placement et de grille

Cas typique :
- page formulaire avec plusieurs `input`, `select`, `switch`, `checkbox`, `button`
- chaque champ garde son propre texte, son aide, son required, etc.
- plusieurs champs partagent quand meme un style commun
- les lignes et colonnes doivent rester pilotables explicitement

Exemple :

```json
{
  "families": {
    "inputs": {
      "label": "Inputs",
      "component": "input",
      "mode": "shared",
      "autoBind": true,
      "exclude": {
        "content": ["label", "placeholder", "helpText", "errorMessage"]
      }
    }
  },
  "instances": {
    "firstName": {
      "label": "Prenom",
      "component": "input",
      "family": "inputs",
      "mode": "single",
      "defaults": {
        "variants": {
          "type": "text",
          "required": true
        },
        "content": {
          "label": "Prenom",
          "placeholder": "ex : Jean"
        }
      }
    }
  },
  "layoutGroups": {
    "personalRow1": {
      "label": "Informations personnelles - ligne 1",
      "component": "grid",
      "mode": "layout",
      "children": ["firstName", "lastName"],
      "defaults": {
        "variants": {
          "cols": "1",
          "gap": "lg"
        }
      }
    }
  }
}
```

### Semantique `families`

`families` sert a piloter les reglages communs d'un type de composant repete.

Champs recommandes :
- `label`
- `component` : composant canonique partage par la famille
- `mode` : `shared`
- `binding` / `autoBind` / `exclude`
- `defaults`

Usage recommande :
- variantes visuelles partagees
- options fonctionnelles communes si elles ont un vrai sens produit

Usage deconseille :
- texte, placeholder, aide, options editoriales propres a chaque instance

### Semantique `instances`

`instances` represente une occurrence concrete editable individuellement.

Champs recommandes :
- `label`
- `component`
- `family` : optionnel, rattache l'instance a une famille partagee
- `mode` : `single`
- `binding` / `autoBind`
- `defaults`

Usage recommande :
- labels
- placeholders
- help text
- required
- options d'un select
- texte specifique d'un bouton

### Semantique `layoutGroups`

`layoutGroups` represente le placement et la structure de composition.

Champs recommandes :
- `label`
- `component` : typiquement `grid`
- `mode` : `layout`
- `children` : ids d'`instances` ou de `parts`
- `binding` / `autoBind`
- `defaults`

Usage recommande :
- lignes de formulaire
- groupes 2 colonnes / 3 colonnes
- zones de placement explicites

### Regles d'usage pour repetition non-`list`

- une repetition non-editoriale ne devient pas une `collection`
- utiliser `families` pour le style partage
- utiliser `instances` pour le contenu propre a chaque occurrence
- utiliser `layoutGroups` pour les lignes, grilles et regroupements
- une meme page peut combiner `parts`, `collections`, `families`, `instances`, et `layoutGroups`
- `collections` reste reserve aux vraies listes avec `kind: "list"`

---

## 4. Template Twig - regles

Regles absolues :
- `|default()` obligatoire sur chaque variable exposee
- pas de logique metier, uniquement de l'affichage
- classes selon le mode de style (section 5) : BEM en SCSS, tables d'utilitaires en Tailwind
- pas de styles inline
- accessibilite integree des la conception
- HTML copiable : le Showcase reformate le HTML affiche et copie (indentation, une balise de bloc par ligne), sans changer le rendu. Pas besoin de controle d'espaces Twig ; seule regle : pas de blanc au bord d'un element en ligne (`<a href="/">Accueil</a>`, pas `<a href="/">\n  Accueil\n</a>`), car ce blanc fait partie du rendu

Exemple atom :

```twig
{% set variant  = variant|default('primary') %}
{% set size     = size|default('md') %}
{% set full     = full|default(false) %}
{% set disabled = disabled|default(false) %}
{% set text     = text|default('Cliquez ici') %}

<button class="btn btn--{{ variant }} btn--{{ size }}{% if full %} btn--full{% endif %}" type="button"{% if disabled %} disabled{% endif %}>{{ text }}</button>
```

Exemple molecule :

```twig
{% set label_text = label|default('Label') %}
{% set input_id   = id|default('field') %}
{% set required   = required|default(false) %}
{% set hasError   = hasError|default(false) %}

<div class="form-field{% if hasError %} form-field--error{% endif %}">
  {% include 'dev/components/label/label.twig' with {
    text: label_text,
    for: input_id,
    required: required
  } %}

  {% include 'dev/components/input/input.twig' with {
    id: input_id,
    hasError: hasError
  } %}
</div>
```

Regle `include` :
- toujours passer les variables explicitement via `with { ... }`
- ne jamais compter sur l'heritage de contexte implicite
- quand un parent pilote un enfant via `parts` ou `collections`, passer explicitement les champs plats exposes au composant enfant

---

## 5. Styles d'un composant - mode configure

Open UI propose deux modes de style, choisis en debut de projet dans `openui.config.json` :

```json
{ "styling": "scss" }
```

| `styling` | Doc a lire | Point d'entree par defaut |
|-----------|-----------|---------------------------|
| `"scss"` (defaut, ou fichier absent) | `docs/styling-scss.md` | `dev/assets/scss/style.scss` |
| `"tailwind"` | `docs/styling-tailwind.md` | `dev/assets/css/style.css` |

Lire uniquement la doc du mode configure : elle donne les regles de fichiers, tokens, variantes, nommage et verifications. `styleEntry` permet de deplacer le point d'entree.

Regles communes aux deux modes :
- tokens du design system obligatoires, zero valeur hardcodee si un token existe
- pas de `!important`
- pas de styles inline
- focus visible sur tout element interactif
- mobile first

### Contrat responsive

- concevoir mobile first et utiliser les breakpoints/tokens existants avant d'introduire une rupture locale
- garder un ordre DOM coherent avec l'ordre de lecture et le parcours clavier, meme si la disposition visuelle change
- ne pas masquer un contenu ou une action essentielle pour faire tenir une composition
- eviter tout scroll horizontal global a largeur reduite ou au zoom, sauf contenu reellement bidimensionnel et documente
- permettre aux textes longs, aides, erreurs, libelles et contenus traduits de se replier sans chevauchement ni troncature destructive
- laisser la page piloter le placement global ; un composant ne doit gerer que son adaptation interne
- documenter dans `[nom].md` toute reorganisation, limite de contenu ou contrainte responsive non evidente

---

## 6. Tokens disponibles

Les tokens sont l'etape 1 : ils existent avant le premier composant (kit de depart dans `templates/`). Contrat complet dans `docs/design-tokens.md` :

- variables CSS sur `:root`, memes noms dans les deux modes (`--color-*`, `--font-*`, `--text-*`, `--spacing-*`...)
- deux couches : palette brute, puis roles (`--color-text`, `--color-primary`, `--color-on-primary`, `--color-success-text`...)
- un composant n'utilise que les roles, jamais la palette ni une valeur hexadecimale
- les paires de contraste des roles sont verifiees par `npm run health`

---

## 7. Accessibilite - contrat par type

Principes communs :
- preferer un element HTML natif adapte avant d'ajouter ARIA
- produire un HTML valide et semantique pour l'usage reel
- donner un nom accessible explicite a tout element interactif
- garantir un focus visible, un ordre de focus logique et une utilisation clavier equivalente a la souris
- ne jamais transmettre une information uniquement par la couleur, la forme, la taille ou la position
- conserver des contrastes suffisants pour les textes, les etats et l'indicateur de focus
- documenter dans `[nom].md` ce que le composant garantit et ce que son consommateur doit fournir
- ne jamais annoncer une conformite RGAA sur la seule base d'Axe, du validateur HTML ou d'une revue agentique

Boutons, liens et controles :
- utiliser `button` pour une action et `a[href]` pour une navigation
- definir `type="button"` pour un bouton qui ne soumet pas un formulaire
- utiliser l'attribut natif `disabled` quand l'element le supporte ; reserver `aria-disabled` aux patterns qui ne peuvent pas etre desactives nativement et neutraliser alors toutes les activations
- exposer les etats utiles (`aria-expanded`, `aria-pressed`, `aria-current`, `aria-selected`) seulement lorsque le pattern les exige
- documenter les touches, le focus initial et le retour de focus des composants interactifs complexes

Formulaires :
- associer chaque champ a un `<label>` visible via `for` + `id` quand le controle le permet
- ne pas utiliser le placeholder comme remplacement du label
- regrouper les radios ou cases liees avec `fieldset` et `legend`
- relier aides et erreurs avec `aria-describedby` et exposer `aria-invalid="true"` sur un champ invalide
- rendre les erreurs visibles, explicites et annoncables sans appliquer automatiquement `role="alert"` a tout message
- garder des identifiants uniques dans la page et documenter le comportement de focus apres validation

Images, icones et medias :
- fournir un `alt` pertinent pour une image informative et `alt=""` pour une image decorative
- masquer aux technologies d'assistance une icone decorative redondante avec un texte voisin
- donner un nom accessible a un bouton icone seul
- ne pas inventer une alternative editoriale quand son sens depend du contexte : documenter l'obligation du consommateur
- documenter les besoins de sous-titres, transcription, audiodescription ou fallback quand un media est accepte

Navigation et structure de page :
- definir la langue et un titre explicite sur chaque document complet
- exposer un contenu principal, une hierarchie de titres logique et des landmarks coherents
- nommer uniquement les regions de navigation ambigues ou multiples
- ajouter un lien d'evitement quand une navigation repetee precede le contenu principal
- garder l'ordre DOM coherent avec l'ordre visuel, la lecture et le clavier sur toutes les largeurs

Tableaux, listes et contenus repetes :
- utiliser `table`, `th` et les associations necessaires pour de vraies donnees tabulaires
- utiliser une liste semantique pour un contenu reellement listable
- contextualiser le nom accessible des actions repetees par ligne ou par carte
- ne laisser aucun contenu essentiel disponible uniquement au survol

---

## 8. Procedure complete - creer un composant

### Etape 0 - Verifier les tokens

- le point d'entree des styles et les tokens existent (`npm run health` ne signale rien en `TOKENS`)
- sinon, poser d'abord le kit de depart du mode (`docs/styling-scss.md` ou `docs/styling-tailwind.md`) : pas d'atome sans tokens

### Etape 1 - Creer le dossier

```text
dev/components/[nom]/
```

### Etape 2 - Creer `[nom].json`

- definir `name`, `level`, `category`, `description`
- lister les `variants` et `content`
- chaque controle a un `type`, `label`, `default`, et `options` si `select`
- si le composant compose d'autres composants editables, ajouter `parts`
- si le composant pilote une vraie liste repetitive, ajouter `collections` avec `kind: "list"`
- si plusieurs composants semblables gardent chacun leur propre texte, aide, options ou placement, ne pas les modeliser automatiquement comme une `collection` bulk
- privilegier `autoBind: true` quand les noms du parent suivent la convention prefixee
- utiliser `exclude` pour masquer les champs enfant non pertinents en inspection
- utiliser `binding` explicite seulement si la convention `autoBind` ne convient pas

### Etape 3 - Creer `[nom].twig`

- declarer toutes les variables avec `{% set var = var|default(...) %}`
- construire le HTML avec les classes du mode de style (section 5)
- inclure les components enfants avec `with { ... }`
- integrer les attributs ARIA necessaires

### Etape 4 - Styler le composant

- suivre la doc du mode configure (section 5)
- SCSS : creer `components/_[nom].scss` et l'importer dans le point d'entree
- Tailwind : tables de classes completes en tete du Twig, tokens dans `@theme`
- gerer focus visible, etat desactive, etats et variantes

### Etape 5 - Verifier le chargement des styles

- le composant est style dans le Showcase pour chaque option de variante

### Etape 6 - Creer `[nom].md`

- suivre la structure imposee
- documenter `Usage`, `Props`, `Accessibilite`, `Exemples`
- si le composant expose `parts` ou `collections`, documenter la convention de nommage des champs parent utilises pour les piloter

### Etape 7 - Verifier

- `npm run validate`, `npm run health`, `npm run snapshot -- [nom]` (captures mobile/desktop, focus clavier, Axe)
- la cartographie et le rendu se régénèrent correctement
- le composant apparait dans la liste
- les controles JSON pilotent bien le rendu
- les sous-composants et collections restent détectables si le composant est composé

---

## 9. Conventions de nommage

| Element | Convention | Exemple |
|---------|-----------|---------|
| Dossier composant | `kebab-case` | `form-field/` |
| Fichier Twig | `kebab-case.twig` | `form-field.twig` |
| Fichier JSON | `kebab-case.json` | `form-field.json` |
| Fichier SVG icone | `kebab-case.svg` | `arrow-right.svg` |
| Champ parent `autoBind` | `[prefixe][ChampEnfantCapitalise]` | `ctaText`, `footerCopyright` |

---

## 10. Erreurs frequentes a eviter

| Erreur | Correct |
|--------|---------|
| `<button>` sans `type` | `<button type="button">` |
| Variable Twig sans `|default()` | `{% set text = text|default('...') %}` |
| Valeur CSS hardcodee | Utiliser un token design system |
| `!important` | Revoir la specificite CSS |
| Include Twig sans `with { ... }` | Toujours passer les variables explicitement |
| Copier le JSON complet d'un sous-composant dans le parent | Referencer l'enfant via `parts` ou `collections` |
| Mapper a la main tous les champs alors que la convention suffit | Utiliser `autoBind: true` |
| Exposer en bulk une liste de champs editoriaux item par item | Utiliser `exclude` sur la collection |
| Atom qui inclut une molecule | Respecter la composition descendante |
| `outline: none` sans alternative | Focus visible selon la doc du mode de style |

---

## 11. Convention icones natives

Les icones utilisent un sprite SVG auto-genere.

Architecture :

```text
dev/assets/icons/
|- unitaires/   <- Sources
|- sprite.svg   <- Auto-genere, ne pas modifier a la main
`- doc.html     <- Auto-genere
```

Ajouter une icone :
1. deposer `[nom].svg` dans `dev/assets/icons/unitaires/`
2. laisser le watcher regenerer `sprite.svg` + `doc.html`
3. hors dev server : `npm run icons`

Regles SVG :
- `viewBox` obligatoire
- supprimer `width` / `height` fixes
- `fill="currentColor"`
- noms semantiques en `kebab-case`

Usage de l'atom `icon` :

```twig
{% include 'dev/components/icon/icon.twig' with {
  name: 'search',
  size: 'md',
  label: 'Rechercher'
} %}
```

---

## 12. Separation `app/` vs `dev/`

- `app/` -> réservé à une future interface. Ne pas utiliser tant que le noyau agentique n’est pas stabilisé.
- `dev/` -> projet utilisateur. C'est ici que travaille l'integrateur.

Les styles de `app/` ne doivent pas affecter le rendu des composants `dev/`.
