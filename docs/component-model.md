# Component Model

## Intention

Open UI est un workspace de design system agent-first. Le modele composant doit permettre a un agent de comprendre quoi modifier, quoi reutiliser, quoi creer et quels impacts annoncer.

## Contrat

- `dev/` est la racine des sources du projet. L'outil l'ignore entierement : c'est le contenu d'un projet (ici, le workspace de test clone depuis `open-ui-workspace`).
- Un composant canonique vit dans `dev/components/[name]/`.
- Chaque composant a trois fichiers obligatoires : `[name].json`, `[name].twig`, `[name].md`.
- Le JSON est la source de verite des metadonnees, controles, relations et defaults exposables.
- Le Twig est le rendu, sans logique metier.
- Le Markdown explique l'usage, les props, l'accessibilite et les exemples.
- Un composant interactif ajoute `[name].js` : module sans initialisation, delegation d'evenements sur `document`, cible ses elements par `data-[name]-*`, importe dans le point d'entree JS (`scriptEntry`, par defaut `dev/assets/js/main.js`).
- Les styles suivent le mode de `openui.config.json` : feuille `_[name].scss` importee dans le point d'entree en SCSS (`docs/styling-scss.md`), classes utilitaires dans le Twig en Tailwind (`docs/styling-tailwind.md`).
- Un composant doit etre reutilise avant d'etre recree.
- Modifier une page signifie souvent modifier un composant ou une configuration de composant, pas patcher la page directement.
- Une page canonique vit dans `dev/pages/` avec au minimum `[name].json` et `[name].twig`. Elle etend un gabarit de `dev/layouts/` (`{% extends %}`) qui porte le document, le header et le footer ; les donnees partagees (nom du site, navigation, liens legaux) viennent de `dev/data/site.json`, exposees sous `site`.
- Le controle `image` vaut `{ src, alt }` ; ses paliers de stress passent par les images d'exemple (`/__openui/fake-image/<l>x<h>.svg`) : paysage, portrait, carre, panoramique, minuscule, absente.
- `"stress": false` sur un controle masque ses boutons de stress dans le Showcase (props techniques : identifiant, URL, jeton).
- `preview` (facultatif) donne des valeurs de demonstration au Showcase, a `snapshot` et au test de bout en bout, sans jamais etre injecte dans une page : il separe le contenu de demo des vrais defauts.
- Les valeurs par defaut d'un composant ou d'une page viennent uniquement de son JSON : le moteur les injecte quand une prop n'est pas passee, y compris dans un `include ... only`. Elle utilise les mêmes groupes `variants` et `content` qu'un composant pour exposer ses variables dans le Showcase.
- Le Showcase catalogue composants et pages. Une page y est rendue comme un document HTML complet afin de conserver sa langue, son titre, ses landmarks et sa structure globale pour les contrôles Axe et W3C.

## Index persistant

- `.openui/graph.json` est l'index local généré des composants et pages ; il n'est pas une seconde source de vérité.
- Les JSON et les `include` Twig alimentent l'index.
- Chaque composant expose ses dépendances directes (`uses`), ses parents directs (`usedBy`) et toutes les pages qui le contiennent directement ou indirectement (`pages`).
- Chaque page expose tous les composants qu'elle contient, y compris par composition transitive.
- Le fichier reste compact, déterministe et ignoré par Git afin d'être lu rapidement par un agent.
- `npm run validate` et `npm run graph` le régénèrent ; `npm run graph:check` détecte un index absent ou périmé.

## Statut de travail

- Un composant ou une page peut déclarer `status: "todo"`, `status: "in-progress"` ou `status: "done"` dans son JSON.
- L'absence de statut vaut `done` pour la compatibilité avec les composants existants.
- Une nouvelle cible passe à `in-progress` au début de son implémentation puis à `done` seulement après les vérifications attendues.
- L'index agrège ces statuts, mais ne stocke pas les décisions : celles-ci restent dans `MEMORY.md`.

## Démarrage à vide

- `showcase/` appartient au moteur versionné et n'est pas généré par le workspace utilisateur.
- `dev/` peut être vide ou absent : la cartographie et le Showcase doivent alors retourner zéro composant et zéro page sans échouer.
- Le point d'entrée des styles (`styleEntry`) devient nécessaire seulement lorsqu'un projet commence à définir ses styles ; le Showcase fournit une feuille vide avant sa création.
- `public/` n'est jamais un prérequis : `npm run build` le crée comme sortie générée.

## Hierarchie

- `atom` : element UI indivisible.
- `molecule` : composition d'atoms.
- `organism` : composition de molecules.
- `template` : structure de page sans contenu reel.
- `page` : instance avec contenu reel, dans `dev/pages/`.

La composition reste descendante : un atom n'inclut pas une molecule, un organism n'inclut pas un template.

## Relations JSON

- `parts` : sous-composant unique, editable sans dupliquer son schema canonique.
- `collections` : vraie liste editoriale ou repetable, explicitement marquee avec `kind: "list"`.
- `families` : reglages communs pour composants repetes non editoriaux.
- `instances` : occurrences concretes editables individuellement.
- `layoutGroups` : placement, grilles, lignes et groupes visuels.

## Contrôles de liste

Un contrôle `type: "array"` peut déclarer la forme humaine de chaque élément avec `item` :

```json
{
  "label": "Liens de navigation",
  "type": "array",
  "item": {
    "label": "Lien",
    "addLabel": "Ajouter un lien",
    "fields": {
      "text": { "label": "Libellé", "type": "text", "default": "Nouveau lien" },
      "href": { "label": "Destination", "type": "text", "default": "#" }
    }
  },
  "default": []
}
```

- `item.fields` décrit un objet répétable ; chaque clé devient un champ du Showcase.
- `item.type` décrit une liste de valeurs simples, par exemple du texte ou des nombres.
- Les types imbriqués acceptés sont `text`, `number`, `checkbox`, `select` et `color`.
- Si `item` manque mais que la liste contient déjà des valeurs, le Showcase tente d'en déduire la forme.
- Une liste vide sans schéma `item` conserve l'éditeur JSON comme repli, car sa structure ne peut pas être devinée sans risque.

## Questions a resoudre

- Jusqu'ou autoriser la profondeur de composition avant de complexifier l'analyse ?
- Faut-il stabiliser un schema JSON formel et versionne ?
- Comment declarer clairement les variantes experimentales vs canoniques ?
- Comment gerer un composant qui existe dans plusieurs projets avec variantes locales ?
- Faut-il renommer les controles pour mieux separer design, contenu et comportement ?
