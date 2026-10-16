# Agent Workflow

## Intention

Open UI vise des resultats : l'agent doit comprendre le design system, modifier au bon niveau, reutiliser les composants existants, creer seulement quand c'est justifie, puis verifier les impacts.

## Contrat de travail

Pour toute demande utilisateur, l'agent suit cette sequence :

1. Comprendre l'intention produit, pas seulement les mots.
2. Lire `.openui/graph.json` pour cartographier les composants/pages concernés sans charger tout le projet ; lancer `npm run graph` s'il manque ou est périmé.
3. Chercher une reutilisation ou une variante existante avant de creer.
4. Choisir le niveau de modification : page, instance, composant, token ou convention.
5. Annoncer les impacts si le changement est transversal.
6. Modifier peu de fichiers, mais les bons.
7. Verifier avec les scripts disponibles.
8. Rendre un bilan clair : changement, impact, verification, risques.

## Regles fortes

- Ne pas patcher une page si le besoin concerne un composant reutilise.
- Ne pas creer un nouveau composant si une variante ou composition existante suffit.
- Ne pas modifier un token sans annoncer l'impact transversal probable.
- Ne pas casser le design system pour satisfaire un cas local.
- Ne pas confondre maquette/esquisse et composant canonique.
- Marquer `status: "in-progress"` dans le JSON d'une cible commencée, puis `done` seulement après les vérifications attendues.

## Entree Figma finalisee

Une maquette Figma finalisee suit le skill `figma-to-open-ui`, distinct du tunnel de sketch exploratoire :

1. `/open-ui-analyze-figma <url>` lit Figma, confronte la bibliotheque et produit `.openui/analyses/<slug>.json` sans modifier le design system.
2. L'utilisateur confirme ou corrige les reutilisations, variantes, nouveaux composants, impacts et questions structurantes.
3. `/open-ui-implement-figma <analyse>` exige le statut `approved`, implemente composants puis page, compare le rendu a Figma et verifie responsive, interactions, HTML, Axe et risques RGAA.
4. Une question RGAA contextuelle qui conditionne le HTML, le focus, l'ordre de lecture ou le contenu accessible empeche le statut `done` tant qu'elle n'est pas arbitree.

Le detail operatoire et le format d'analyse vivent dans `skill-src/skills/figma-to-open-ui/`. La copie `.agents/skills/figma-to-open-ui/` est générée pour Codex. `GUIDELINES_AI.md` reste la source des invariants techniques du design system.

## Creation

Creer est legitime dans deux cas :

- nouveau composant canonique utile au design system ;
- esquisse ou maquette exploratoire explicitement marquee comme telle.

Un composant canonique doit avoir JSON, Twig, Markdown et SCSS si necessaire. Une esquisse peut etre plus libre, mais ne doit pas etre presentee comme composant stable.

## Verifications minimales

- `npm run validate`
- `npm run graph:check`
- `npm run list` si la cartographie doit etre relue
- `npm run impact -- <component>` si un composant est touche
- `npm run lint:scss` si SCSS touche
- `npm run build` si rendu/imports/pages touches

## Questions a resoudre

- Comment l'agent doit-il arbitrer entre modification locale et nouvelle variante ?
- Quel format de bilan standard adopter apres chaque modification ?
- Quand bb9 doit-il entrer dans la boucle agentique Open UI ?
- Comment faire travailler plusieurs agents sans perdre l'integrite du design system ?
