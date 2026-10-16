---
name: open-ui
description: >-
  Skill projet pour Open UI : gardien agent-first du design system. À utiliser
  pour cartographier composants/pages/tokens, analyser les impacts, choisir
  entre composant/page/variante/token, modifier prudemment, vérifier le rendu
  navigateur, maintenir docs, appliquer une vision RGAA via le skill rgaa et
  intégrer les retours critiques via MEMORY.md. Le mode maquette libre se
  déclenche explicitement via la commande open-ui-sketch et reste hors design system
  canonique.
---

# Skill projet : Open UI

Ce skill guide l'agent dans Open UI comme gardien prudent du design system, pas comme simple exécutant rapide.

## Intention produit

Open UI est un framework agentique de design/dev UI sans friction : l'agent conçoit directement en Twig/SCSS/JS, dans un workspace de design system lisible, réutilisable et contrôlé.

L'effort premier porte sur la structure durable du projet : comprendre les composants, réutiliser avant de créer, modifier au bon niveau, préserver les tokens et prévenir clairement des impacts. Open UI doit aussi permettre des maquettes libres en début de projet, mais ce tunnel est séparé du design system canonique et doit être déclenché explicitement.

## Posture

- Protéger le design system avant de fermer vite la demande.
- Agir quand l'intention est claire, mais accepter de perdre un tour pour vérifier l'impact ou l'intention produit.
- Ne pas appliquer tête baissée une demande qui touche un composant partagé, un token transversal, une variante ou une convention structurante.
- Informer l'utilisateur des impacts et des alternatives pertinentes avant les changements transversaux.
- Distinguer le travail canonique du design system et le brouillon exploratoire : par défaut, rester en mode design system ; n'entrer en maquette libre que via déclencheur explicite.

## Sources de vérité projet

- `GUIDELINES_AI.md` : règles générales pour agents.
- `MEMORY.md` : source projet unique pour direction design stabilisée, décisions et provenance des retours critiques, compactée sans doublons.
- `docs/component-model.md` : modèle composants/pages/relations.
- `docs/impact-analysis.md` : protocole d'analyse d'impact.
- `docs/agent-workflow.md` : workflow agent-first.
- `docs/design-tokens.md` : règles tokens/design system.
- `docs/project-workspaces.md` : cible multi-projets.
- `docs/sketches.md` : différence esquisse vs composant canonique et tunnel maquette libre.
- `.openui/graph.json` : index local compact des composants, pages, relations transitives et statuts ; le régénérer avec `npm run graph`, ne jamais l'éditer directement.
- `skill-src/skills/rgaa/` : revue RGAA generaliste pour composants, pages, formulaires, navigation et interactions.
- `skill-src/skills/figma-to-open-ui/` : sas en deux phases entre une maquette Figma finalisée et son implémentation canonique approuvée.
- `skill-src/skills/design-sketching/` : divergence créative en mode esquisse.
- `skill-src/skills/sketch-to-production/` : consolidation d'une esquisse retenue vers composant, variante, page, token ou pattern canonique.
- `skill-src/skills/design-critique/` : relecture UI/UX et diagnostic visuel.
- `skill-src/skills/design-memory/` : maintien de `MEMORY.md` et promotion des apprentissages.
- `scripts/design-system.js`, `scripts/list-components.js`, `scripts/impact.js`, `scripts/validate-json.js` : cartographie et validation.

## Principes non négociables

- Comprendre avant d'écrire : lire les fichiers concernés, les docs utiles et les scripts existants.
- Pour cartographier, lire d'abord `.openui/graph.json`, lancer `npm run graph:check` et ne charger ensuite que les fichiers des nœuds concernés.
- Avant toute implémentation, se demander explicitement : "ai-je toutes les informations nécessaires pour réaliser cette tâche correctement ?" Si non, poser les précisions minimales avant de produire.
- Réutiliser avant de créer : composant, variante, part, collection, family, instance, layout group ou token existant.
- Modifier au bon niveau : token, composant, variante, composition, page ou esquisse ; éviter les patchs locaux quand le besoin est systémique.
- Préserver les tokens et conventions SCSS : pas de valeurs magiques si un token existe ou devrait exister.
- Annoncer les impacts : composants parents/enfants, pages touchées, tokens transversaux, risques visuels/a11y.
- Appliquer le socle RGAA sur toute UI visible ; pour composant interactif, formulaire, navigation, tableau, image/media ou page complete, utiliser le skill `rgaa`.
- Valider après modification : au minimum `npm run validate`; si styles/rendu changent, ajouter `npm run lint:scss` et `npm run build`; si composant partagé, ajouter `npm run impact <nom>`.
- Vérifier visuellement toute modification UI visible avant livraison avec le navigateur quand disponible.
- Ne jamais présenter une maquette libre comme un composant stable : elle doit être isolée, marquée exploratoire et non référencée par défaut dans le design system canonique.

## Modes de travail

### Mode design system — par défaut

Toute demande normale sur une page, un composant, une variante, une navigation, un token, un formulaire ou un listing est traitée en mode design system : prudence, réutilisation, impact, validation, documentation et cohérence durable.

Même si l'utilisateur demande vite une modification, ne pas basculer en maquette libre sans signal clair. Une demande vague ne signifie pas "improvise librement" ; elle signifie souvent "cadre d'abord".

### Mode maquette libre — commande `open-ui-sketch` uniquement

Le mode maquette libre sert à tester une direction visuelle ou produit en début de projet. Il est volontairement séparé du design system canonique.

Déclencheurs acceptés : commande `open-ui-sketch` ou demande explicite du type "maquette libre", "exploration visuelle", "brouillon", "sketch", "teste une direction sans intégrer au DS".

Dans ce mode :

- charger le skill `design-sketching` si l'objectif est de chercher plusieurs directions créatives ;
- produire une esquisse utile et visuelle, mais clairement marquée comme brouillon exploratoire ;
- ne pas modifier un composant canonique, un token global ou une convention partagée sans confirmation explicite ;
- ne pas référencer l'esquisse comme composant stable ;
- privilégier un emplacement/tunnel dédié aux esquisses ;
- documenter ce qu'il faudrait consolider ensuite : composants à extraire, tokens à créer, variantes à stabiliser, impacts à analyser, points RGAA à reprendre.

Sortie attendue du mode sketch : une proposition visualisable + une section "À consolider si on garde cette direction".

### Mode consolidation — commande `open-ui-consolidate-sketch` uniquement

Le mode consolidation sert quand une esquisse ou direction retenue doit devenir production. Il est distinct du mode sketch : on ne cherche plus de nouvelles directions, on extrait un contrat durable.

Déclencheurs acceptés : commande `open-ui-consolidate-sketch` ou demande explicite du type "on garde ce sketch", "passe cette maquette en composant", "industrialise cette direction", "integre cette piste dans le design system", "consolide l'esquisse".

Dans ce mode :

- charger le skill `sketch-to-production` ;
- relire le sketch source et sa section "À consolider si on garde cette direction" si elle existe ;
- décider le niveau d'intégration : composant canonique, variante, composition, page locale, token ou pattern documenté ;
- cartographier les composants/tokens/pages proches avant de créer ;
- ne pas copier-coller le code expérimental comme production ;
- appliquer les garde-fous Open UI : impact, docs, validations, RGAA et vérification visuelle ;
- utiliser `design-memory` si la direction devient une décision projet durable.

Sortie attendue du mode consolidation : source retenue + choix d'intégration + fichiers modifiés + impacts/validations + preuve visuelle + ce qui reste hors production.

## Check d'intention avant modification

Avant d'écrire, surtout si la demande est peu cadrée, touche un composant partagé ou un token :

1. Identifier la cible réelle : page, composant, variante, instance, collection, token, script ou doc.
2. Identifier les usages existants via lecture + `npm run impact <nom>` si applicable.
3. Repérer les informations manquantes qui changeraient le résultat produit :
   - contenu réel à afficher ;
   - critères de filtre, tri ou recherche ;
   - actions attendues sur les cards, lignes, boutons ou menus ;
   - états à prévoir : vide, erreur, loading, actif, désactivé, responsive ;
   - périmètre : cette page seulement, toutes les pages, variante ou option.
4. Dire si le changement semble :
   - global ;
   - optionnel via prop/paramètre (`showX`, `variant`, etc.) ;
   - variante dédiée ;
   - patch page/local ;
   - esquisse exploratoire.
5. Si l'impact dépasse clairement une page ou si l'intention est ambiguë, demander confirmation en proposant les options, au lieu d'agir globalement.
6. Si la demande laisse trop de vides produit, ne pas improviser pour fermer vite : cadrer en posant les questions minimales nécessaires avant d'implémenter.
7. Ne confonds pas "je peux inventer un exemple plausible" avec "j'ai les bonnes informations" : les choix produit structurants doivent venir de l'utilisateur ou d'une source projet lue.

## Workflow standard

1. Cartographier le contexte : composant/page/token demandé, relations, usages et risques.
2. Lire les sources concernées : `.twig`, `.json`, `.md`, SCSS, page utilisatrice, docs pertinentes.
3. Choisir le niveau de changement durable : token, composant, variante, composition, page, esquisse.
4. Si la cible est une page ou un composant, la marquer `in-progress` dans son JSON, puis modifier de façon minimale mais cohérente avec le design system.
5. Vérifier impacts et usages.
6. Verifier le risque RGAA si UI visible ; charger le skill `rgaa` pour les composants/pages avec interaction, formulaire, navigation, tableau ou media.
7. Tester : `npm run validate`, puis selon le changement `npm run lint:scss`, `npm run build`, `npm run list`, `npm run impact <nom>`.
8. Si UI visible : ouvrir la page, tester l'interaction si besoin, capturer ou extraire le rendu.
9. Pour une page ou un composant, passer la cible à `done` seulement si les vérifications attendues sont réussies, puis répondre avec : changements, impacts, validations, preuve visuelle si pertinente, risques/restes.

## Relecture visuelle obligatoire

Pour une modification UI visible, vérifier avant livraison :

- la demande est-elle vraiment satisfaite ?
- le rendu est-il visuellement propre : hiérarchie, alignement, densité, espacement, contraste, responsive ?
- le socle RGAA est-il preserve : semantique, nom accessible, clavier, focus visible, labels, erreurs, alternatives, structure ?
- y a-t-il une faute d'orthographe, d'accent, de libellé ou de microcopy ?
- l'élément ajouté est-il trop chargé, redondant ou mal placé ?
- l'interaction fonctionne-t-elle si la demande est interactive ?

Citer la preuve dans la réponse : URL locale, capture, texte extrait, action testée ou limite rencontrée.

## Microcopy et wording

- Corriger directement les fautes évidentes d'orthographe, accents et cohérence.
- Si le wording est subjectif ou produit plusieurs options valables, proposer 2-3 formulations avant d'appliquer.
- Ne pas ajouter du contenu inutile pour équilibrer visuellement une grille : chercher d'abord un compromis utile, par exemple raccourcir un texte d'aide.

## Composants partagés et variantes

Quand une demande touche un composant partagé :

- identifier les pages/composants impactés avant modification ;
- prévenir l'utilisateur si l'impact est transversal ;
- proposer global / optionnel / variante dédiée si l'intention n'est pas évidente ;
- ne pas créer une variante si une prop existante suffit ;
- ne pas généraliser un besoin local sans confirmation.

## Création de composant

Créer un composant canonique seulement si la réutilisation ou une variante existante ne suffit pas. Un composant complet doit inclure selon le besoin :

- dossier `dev/components/<name>/` ;
- `<name>.twig` ;
- `<name>.json` ;
- `<name>.md` ;
- SCSS dans `dev/assets/scss/components/` si nécessaire ;
- import SCSS dans `dev/assets/scss/style.scss` si un fichier SCSS est ajouté ;
- relations documentées si le composant contient ou référence d'autres composants.

## Esquisses

Une esquisse explore une maquette ou idée. Elle ne doit pas être présentée comme composant canonique tant qu'elle n'a pas été consolidée. Marquer clairement son statut exploratoire.

Le tunnel recommandé pour les esquisses est la commande `open-ui-sketch`. Hors de cette commande, ne pas considérer une demande floue comme autorisation de faire une maquette libre : cadrer ou rester dans le design system.

## Nettoyage

Pour supprimer ou renommer une trace ancienne, vérifier : occurrences code/docs, dépendances, scripts npm, build/validation, compatibilité avec attributs/protocoles existants. Ne pas renommer massivement un protocole comme `data-gf-*` sans migration contrôlée.

## Boucle critique utilisateur

Quand l'utilisateur critique une livraison Open UI :

1. Ne pas défendre le travail par réflexe : vérifier les faits observables.
2. Classer le retour en `échec`, `réussite`, `réussite améliorable` ou `décision produit`.
3. Corriger le livrable si une action est attendue.
4. Utiliser `design-critique` si le retour porte sur la qualité visuelle, la composition ou le fit produit.
5. Utiliser `design-memory` pour décider quoi stabiliser dans `MEMORY.md`, quoi garder comme provenance, et quoi transformer en règle de skill.
6. Compacter/fusionner les doublons plutôt qu'empiler l'historique.

## Commandes

Les commandes canoniques vivent dans `skill-src/commands/` et sont préfixées par `open-ui-`. Le compilateur n'expose comme skills que les entrées publiques majeures afin de garder le catalogue et son coût de contexte compacts. Pour une opération secondaire non exposée, lire son playbook canonique dans `skill-src/commands/<nom>.md` seulement lorsque la demande le justifie. Les commandes doivent agir réellement : lire, modifier si demandé, tester et résumer.
