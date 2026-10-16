# Open UI

![alt text](image.png)

Open UI est un workspace de design system pensé pour être lu et manipulé autant par des développeurs que par des agents. Les composants et les pages sont décrits par un contrat JSON, rendus avec Twig, stylés en SCSS ou en Tailwind et consultables dans un Showcase interactif.

Le projet peut démarrer sans aucun composant : `dev/` peut être vide et `public/` absent. Le Showcase reste disponible et présente alors un état de démarrage explicite.

## Prérequis

- Node.js 22 ou plus récent recommandé ;
- npm, fourni avec Node.js.

## Installation

Depuis la racine du dépôt :

```bash
npm ci
npm run dev
```

Ouvrir ensuite :

- `http://localhost:3000/` pour l’index du workspace ;
- `http://localhost:3000/showcase/` pour le design system interactif.

Sous PowerShell, si l’exécution de `npm.ps1` est bloquée par la stratégie système, utilisez directement l’exécutable Windows :

```powershell
npm.cmd ci
npm.cmd run dev
```

Cette solution ne demande aucune modification de la stratégie d’exécution PowerShell.

Pour les captures `npm run snapshot` (vérification visuelle des agents), installer une fois le navigateur de Playwright, environ 120 Mo hors du projet :

```bash
npx playwright install chromium
```

## Démarrage depuis un workspace vide

Aucune commande d’initialisation n’est nécessaire. Le moteur du Showcase est livré et versionné dans `showcase/`.

- `dev/` est la racine structurelle des sources projet. Le dépôt conserve `dev/.gitkeep`, mais son contenu est actuellement ignoré par Git.
- `public/` est une sortie générée. Vite le crée automatiquement pendant le build.
- `showcase/` contient l’outil système : catalogue des composants et pages, inspecteur de propriétés, iframe de rendu et affichage du HTML courant.
- La feuille de styles du projet est facultative au départ. Le Showcase utilise une feuille vide tant qu’elle n’existe pas, puis charge automatiquement les styles du projet lorsqu’elle est créée.

Un workspace sans composant n’est donc pas une erreur : le catalogue affiche `0` et guide la création du premier composant.

## Choisir le mode de style

Le mode de style se choisit en début de projet dans `openui.config.json` :

```json
{
  "styling": "scss",
  "styleEntry": "dev/assets/scss/style.scss"
}
```

| `styling` | Styles d’un composant | Kit de départ | Règles |
|---|---|---|---|
| `scss` (défaut, ou fichier absent) | `dev/assets/scss/components/_button.scss`, importé dans `style.scss` | `templates/scss/` | [docs/styling-scss.md](./docs/styling-scss.md) |
| `tailwind` | classes utilitaires dans `button.twig`, tokens dans `@theme` | `templates/tailwind/style.css` | [docs/styling-tailwind.md](./docs/styling-tailwind.md) |

`styleEntry` est facultatif : par défaut `dev/assets/scss/style.scss` en SCSS et `dev/assets/css/style.css` en Tailwind. `scriptEntry` (par défaut `dev/assets/js/main.js`) est le point d'entrée JS qui importe le script des composants interactifs. Relancer `npm run dev` après un changement de configuration.

## Poser les tokens (étape 1)

Avant le premier composant, copier le kit de départ du mode choisi : tokens, deux polices auto-hébergées, reset, typographie, conteneur et grille 12 colonnes responsive.

| Mode | Copier |
|---|---|
| `scss` | `templates/scss/` → `dev/assets/scss/` et `templates/fonts/` → `dev/assets/fonts/` |
| `tailwind` | `templates/tailwind/style.css` → `dev/assets/css/style.css` et `templates/fonts/` → `dev/assets/fonts/` |

Les tokens sont des variables CSS en deux couches, une palette puis des rôles (`--color-primary`, `--color-on-primary`, `--color-success-text`…), avec les mêmes noms dans les deux modes. Les composants n'utilisent que les rôles. `npm run health` vérifie les contrastes entre rôles. Contrat complet : [docs/design-tokens.md](./docs/design-tokens.md).

## Ajouter un premier composant

Chaque composant canonique vit dans son propre dossier :

```text
dev/components/button/
|- button.json
|- button.twig
|- button.md
`- button.js      (seulement si le composant est interactif, importé dans dev/assets/js/main.js)
```

Le JSON décrit les métadonnées, variantes et contenus modifiables. Le Showcase transforme ces déclarations en contrôles humains, rerend le Twig à chaque modification et maintient le HTML affiché à jour.

Le contrat complet est documenté dans [GUIDELINES_AI.md](./GUIDELINES_AI.md) et [docs/component-model.md](./docs/component-model.md).

Une page suit le même principe dans `dev/pages/` : `[nom].json` expose ses variantes et contenus, et `[nom].twig` étend un gabarit de `dev/layouts/` (document, header, footer) en remplissant ses blocs. Les données communes aux pages (nom du site, navigation, liens légaux) vivent dans `dev/data/site.json`. Le livrable est le HTML statique et ses assets produits par `npm run build` ; Twig ne sert qu'à composer. Le Showcase la présente dans une section `Pages` distincte et rerend le document à chaque modification.

## Contrôler la qualité du rendu

Dans le Showcase, Axe analyse automatiquement chaque nouveau rendu après une courte temporisation. Le bouton `Contrôler le rendu` relance Axe et ajoute la validation HTML W3C sur la variante de composant ou de page actuellement affichée :

- **Nu HTML Checker** contrôle un composant dans un document HTML minimal ou une page comme document complet ;
- **Axe** contrôle localement les règles d’accessibilité automatisables dans l’iframe, y compris la structure globale lorsqu'une page est sélectionnée, sans envoyer le DOM à un service externe.

Le panneau conserve séparément les erreurs HTML, les violations Axe et les vérifications RGAA manuelles. Un résultat sans erreur est formulé `Aucune erreur automatique détectée` : il ne constitue jamais une preuve de conformité RGAA.

Par défaut, le HTML rendu est transmis au service officiel `https://validator.w3.org/nu/`. Aucun JSON, Twig ou SCSS n’est envoyé. Pour utiliser une instance Nu locale ou privée, configurez son URL avant de lancer Vite :

```powershell
$env:OPENUI_W3C_VALIDATOR_URL = 'http://localhost:8888/'
npm.cmd run dev
```

```bash
OPENUI_W3C_VALIDATOR_URL=http://localhost:8888/ npm run dev
```

Si le service Nu est indisponible, le Showcase affiche un contrôle HTML partiel sans bloquer l’analyse Axe locale.

## Développer l'outil : la branche `workspace`

Ce dépôt produit l'outil : `dev/` y est ignoré pour ne pas livrer nos composants de test. Pour éprouver l'outil sur du vrai contenu, la branche `workspace` versionne un `dev/` peuplé (tokens, composants, gabarit, page).

- **Ne jamais fusionner `workspace` dans `develop` ni dans `main`.** Le sens est toujours `develop` → `workspace`.
- Tester une évolution de l'outil : `git checkout workspace && git merge develop`, puis `npm run dev`, `npm test`, `npm run snapshot -- <nom>`.
- Revenir sur `develop` retire `dev/` du dossier de travail : c'est normal, il n'existe que sur `workspace`.
- Pour garder les deux côte à côte : `git worktree add ../open-ui-workspace workspace`.

## Architecture

```text
open-ui/
|- .openui/      index local compact et analyses de travail
|- dev/          sources locales du projet utilisateur
|- showcase/     application système versionnée
|- scripts/      validation, cartographie, impact et génération
|- skill-src/    source canonique portable des skills et commandes agents
|- docs/         contrats et décisions d’architecture
`- public/       rendu généré par Vite
```

Le Showcase ne réécrit jamais les JSON : les modifications faites dans son formulaire sont temporaires. Le rendu Twig live et son API nécessitent `npm run dev` ; ils ne fonctionnent pas en ouvrant les fichiers avec `file://`.

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance Vite, le Showcase et les mises à jour live |
| `npm run build` | Génère le rendu dans `public/` |
| `npm run validate` | Valide les contrats JSON et régénère l’index local |
| `npm run health` | Contrôle la dette structurelle : nommage, fichiers, docs, imports de styles, contrastes des tokens |
| `npm run snapshot -- <composant>` | Capture chaque variante en mobile et desktop, le focus clavier, et lance Axe (Playwright) |
| `npm run test` | Lance les tests automatisés |
| `npm run test:empty` | Construit une copie temporaire sans `dev/` ni `public/` |
| `npm run lint:scss` | Vérifie les sources SCSS présentes (mode SCSS) |
| `npm run graph` | Régénère `.openui/graph.json` |
| `npm run graph:check` | Vérifie que l’index correspond aux sources |
| `npm run list` | Liste les composants et les pages détectés |
| `npm run impact -- <composant>` | Cartographie les usages d’un composant |
| `npm run skills:build -- --target codex` | Génère uniquement les skills du harnais demandé ; redémarrer ensuite la session de l'agent pour qu'il les charge |
| `npm run skills:check -- --target codex` | Vérifie qu'une sortie de skills correspond à `skill-src/` |
| `npm run clean` | Supprime la sortie générée `public/` |

`npm run build` remplace le contenu existant de `public/`. Ce dossier est ignoré par Git pendant le développement actuel ; lorsqu’il deviendra un livrable de production versionné, il faudra retirer sa règle du `.gitignore`.

`.openui/graph.json` est un index local généré, compact et ignoré par Git. Il donne aux agents les relations composants/pages et leur statut sans charger tous les JSON et Twig. Les JSON restent les sources de vérité ; `MEMORY.md` reste la source des décisions projet.

## Principes du projet

- Réutiliser un composant ou une variante avant d’en créer un nouveau.
- Garder le JSON comme contrat des variables exposées.
- Garder Twig concentré sur le rendu, sans logique métier.
- Utiliser les tokens du design system et intégrer l’accessibilité dès la conception.
- Vérifier les impacts avant toute modification d’un composant partagé.
