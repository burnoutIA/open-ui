# GUIDELINES_AI.md - Open UI

> Regles minimales pour qu'un agent cree un composant ou une page conforme. Le reste se lit a la demande dans `docs/` :
> styles du mode configure (`styling-scss.md` ou `styling-tailwind.md`), tokens (`design-tokens.md`), composition JSON avancee (`component-composition.md`), impact, workflow, esquisses.
>
> Twig sert a travailler de maniere atomique (includes, gabarits). Le livrable est le HTML et les assets statiques generes par `npm run build`, pas le Twig.

---

## 1. Hierarchie Atomic Design

| Niveau | `level` JSON | Emplacement | Description |
|--------|--------------|-------------|-------------|
| **Atom** | `"atom"` | `dev/components/[nom]/` | Element indivisible : bouton, lien, badge |
| **Molecule** | `"molecule"` | `dev/components/[nom]/` | Petit assemblage : champ de formulaire complet, carte |
| **Organism** | `"organism"` | `dev/components/[nom]/` | Bloc fonctionnel : header, footer, formulaire |
| **Template** | - | `dev/layouts/[nom].twig` | Gabarit de page : document, header, footer et blocs a remplir ; hors catalogue |
| **Page** | - | `dev/pages/[nom].json` + `.twig` | Contenu reel ; etend un gabarit (`{% extends %}`) |

La composition est toujours descendante : un atom n'inclut jamais une molecule, un organism n'inclut jamais un gabarit.

Les donnees partagees par toutes les pages (nom du site, navigation, liens legaux) vivent dans `dev/data/site.json` et sont disponibles dans tout Twig sous `site`.

---

## 2. Structure d'un composant

```text
dev/components/[nom]/
|- [nom].json   <- source de verite : metadonnees, controles et valeurs par defaut
|- [nom].twig   <- rendu
|- [nom].md     <- documentation obligatoire
`- [nom].js     <- comportement, seulement si le composant est interactif
```

Styles : selon le mode de `openui.config.json` (section 5).

Script (`[nom].js`), s'il en faut un :
- module ES sans export ni initialisation : delegation d'evenements sur `document`, donc actif sur une page comme dans le Showcase
- cible ses elements par des attributs `data-[nom]-*`, jamais par ses classes de style
- amelioration progressive : sans JavaScript, le contenu reste accessible
- importe dans le point d'entree JS (`scriptEntry`, par defaut `dev/assets/js/main.js`) : `import '../../components/[nom]/[nom].js'` ; `npm run health` signale un oubli

Structure imposee pour `[nom].md` : `# Nom`, puis `## Usage`, `## Props` (tableau `Prop | Type | Defaut | Description`), `## Accessibilite` (ce que le composant garantit, ce que le consommateur doit fournir), `## Responsive` si le comportement n'est pas evident, `## Exemples` (includes Twig).

---

## 3. JSON d'un composant

```json
{
  "name": "Button",
  "status": "in-progress",
  "level": "atom",
  "category": "Actions",
  "description": "Declenche une action.",
  "variants": {
    "variant": { "label": "Variante", "type": "select", "default": "primary", "options": ["primary", "secondary"] }
  },
  "content": {
    "text": { "label": "Texte", "type": "text", "default": "Enregistrer" }
  }
}
```

- Obligatoires : `name`, `level`, `category`, `description`.
- `status` : `todo`, `in-progress` ou `done` (absent = `done`). Passer a `in-progress` des le debut d'un travail, a `done` seulement apres les verifications de la section 8.
- `variants` = apparence et etats ; `content` = textes et donnees.
- Types de controles : `select` (avec `options`), `checkbox`, `text`, `number`, `color`, `array` (liste avec `item.fields`, voir `docs/component-model.md`).
- `"stress": false` sur une prop technique (identifiant, URL, jeton) : le Showcase n'affiche pas ses boutons de stress.

Valeurs par defaut :
- le `default` du JSON est la **seule** source : le moteur l'injecte dans le Twig quand la prop n'est pas passee, y compris pour un composant inclus depuis une page ;
- c'est la vraie valeur par defaut du composant, pas un contenu de demonstration : un texte d'aide ou un `autocomplete` par defaut s'appliquerait a chaque usage ;
- une valeur passee, meme `''` ou `false`, est respectee ;
- ne pas repeter le defaut dans le Twig ; un `{% set %}` ne sert qu'aux valeurs derivees (`{% set name = name is empty ? id : name %}`).

Contenu de demonstration : `"preview": { "prop": valeur }` (facultatif, props declarees seulement). Le Showcase, `snapshot` et le test de bout en bout partent de ces valeurs ; le moteur ne les injecte jamais dans une page. A utiliser quand le defaut reel rend le composant vide ou peu parlant (liste d'erreurs vide, champ sans libelle).

Relations : un `include` Twig suffit, le graphe le detecte (`npm run impact [nom]`). Declarer une composition dans le JSON (`parts`, `collections`...) est facultatif : voir `docs/component-composition.md`.

---

## 4. Twig

- uniquement de l'affichage, pas de logique metier ; les tables de classes de variantes (mode Tailwind) sont autorisees
- `include` toujours avec `with { ... } only` : le composant ne recoit que ce qu'on lui passe, le reste vient de ses defauts JSON (twig.js exige `with {} only`, meme vide)
- classes selon le mode de style : BEM en SCSS, tables d'utilitaires en Tailwind
- pas de styles inline
- HTML copiable : le Showcase reformate le HTML affiche et copie. Seule regle d'espaces : pas de blanc au bord d'un element en ligne (`<a href="/">Accueil</a>`, pas `<a href="/">\n  Accueil\n</a>`)

```twig
<button class="btn btn--{{ variant }} btn--{{ size }}{% if full %} btn--full{% endif %}" type="{{ type }}"{% if disabled %} disabled{% endif %}>{{ text }}</button>
```

Page : elle etend un gabarit et remplit ses blocs.

```twig
{% extends 'dev/layouts/base.twig' %}
{% block title %}Contact{% endblock %}
{% block content %}
  <h1>Nous contacter</h1>
  {% include 'dev/components/form-field/form-field.twig' with { label: 'Nom', id: 'name' } only %}
{% endblock %}
```

---

## 5. Styles - mode configure

Le mode se choisit en debut de projet dans `openui.config.json` (`"styling": "scss"` par defaut, ou `"tailwind"`). Lire **uniquement** la doc du mode : `docs/styling-scss.md` ou `docs/styling-tailwind.md`.

Regles communes :
- tokens obligatoires, aucune valeur en dur si un token existe
- pas de `!important`, pas de styles inline
- focus visible sur tout element interactif
- mobile first ; ordre DOM = ordre de lecture et de tabulation, quelle que soit la largeur
- ne jamais masquer un contenu ou une action essentielle pour faire tenir une mise en page ; pas de scroll horizontal global
- textes longs, aides et erreurs se replient sans chevauchement
- la page pilote le placement global ; un composant ne gere que son adaptation interne

---

## 6. Tokens

Etape 1, avant le premier composant (kit de depart dans `templates/`). Contrat complet : `docs/design-tokens.md`.

- variables CSS sur `:root`, memes noms dans les deux modes (`--color-*`, `--font-*`, `--text-*`, `--spacing-*`...)
- deux couches : palette, puis roles (`--color-text`, `--color-primary`, `--color-on-primary`, `--color-success-text`...)
- un composant n'utilise que les roles, jamais la palette ni une valeur hexadecimale
- `npm run health` verifie les contrastes entre roles

---

## 7. Accessibilite

Principes :
- element HTML natif avant ARIA ; HTML valide et semantique
- nom accessible explicite pour tout element interactif
- focus visible, ordre logique, tout utilisable au clavier
- aucune information portee seulement par la couleur, la forme ou la position
- contrastes suffisants pour textes, etats et focus
- documenter dans `[nom].md` ce que le composant garantit et ce que le consommateur doit fournir
- ne jamais annoncer une conformite RGAA sur la seule base d'Axe, du validateur ou d'une revue agentique (skill `rgaa` pour les revues)

Controles : `button` pour une action, `a[href]` pour une navigation ; `type="button"` hors soumission ; `disabled` natif ; etats ARIA (`aria-expanded`, `aria-current`...) seulement si le pattern les exige.

Formulaires : `<label for>` visible ; jamais le placeholder comme label ; `fieldset` + `legend` pour les groupes ; aide et erreur reliees par `aria-describedby`, `aria-invalid="true"` en erreur ; message d'erreur qui dit quoi corriger ; `id` uniques dans la page.

Images et icones : `alt` pertinent si informative, `alt=""` si decorative ; icone decorative en `aria-hidden="true"` ; bouton icone seul avec un nom accessible.

Page : `lang`, `title` explicite, un `main`, titres hierarchises, `nav` nommees si plusieurs, lien d'evitement avant une navigation repetee.

---

## 8. Procedure - creer un composant

0. Tokens en place (`npm run health` sans erreur `TOKENS`) ; sinon poser d'abord le kit de depart.
1. Chercher un composant ou une variante existante (`npm run list`, `.openui/graph.json`) avant de creer.
2. `[nom].json` en `in-progress`, avec les vraies valeurs par defaut.
3. `[nom].twig`, styles du mode, `[nom].js` si interactif (et son import).
4. `[nom].md`.
5. Verifier : `npm run validate`, `npm run health`, `npm run snapshot -- [nom]` (captures mobile/desktop, focus clavier, Axe), relire les captures ; `npm run impact -- [nom]` si le composant etait deja utilise.
6. Passer a `done`.

---

## 9. Nommage

| Element | Convention | Exemple |
|---------|-----------|---------|
| Dossier, fichiers d'un composant | `kebab-case` | `form-field/form-field.twig` |
| Props JSON | `camelCase` | `navLabel`, `newWindow` |
| Attributs de script | `data-[nom]-*` | `data-site-header-toggle` |
| Fichier SVG | `kebab-case.svg` | `arrow-right.svg` |

---

## 10. Erreurs frequentes

| Erreur | Correct |
|--------|---------|
| `<button>` sans `type` | `<button type="button">` |
| Defaut repete dans le Twig (`text\|default('...')`) | Defaut dans le JSON seulement |
| Contenu de demonstration comme `default` | Vraie valeur par defaut ; le contenu reel est passe par la page |
| `include` sans `only` | `with { ... } only` (twig.js : `with {} only`) |
| Valeur CSS en dur ou couleur de palette | Un role ou une echelle de tokens |
| `outline: none` sans alternative | Focus visible selon la doc du mode |
| Page qui recopie `head`, header et footer | `{% extends 'dev/layouts/base.twig' %}` |
| Atom qui inclut une molecule | Composition descendante |

---

## 11. Icones

Pas encore de systeme d'icones : SVG en ligne, `aria-hidden="true" focusable="false"`, couleur `currentColor` (exemples : `header`, `link`). Sources SVG facultatives dans `dev/assets/icons/unitaires/` (`npm run icons` les liste). Un atome `icon` et un sprite seront a creer quand plusieurs composants partageront les memes icones.
