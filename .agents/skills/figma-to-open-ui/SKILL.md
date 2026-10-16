---
name: figma-to-open-ui
description: Workflow Open UI en deux phases pour analyser une page ou un composant Figma avant toute ecriture, faire valider la reutilisation, les variantes et les nouveaux composants, puis implementer la maquette approuvee avec verification visuelle, responsive, Axe et questions RGAA ciblees. A utiliser avec une URL Figma, une demande d'analyse Figma, `open-ui-analyze-figma` ou `open-ui-implement-figma`.
---

# Figma To Open UI

Transformer une maquette Figma finalisee en implementation Open UI sans contourner le design system. Separer strictement l'analyse et l'implementation afin que l'utilisateur confirme les choix structurants avant toute modification canonique.

## Coordination

- Charger `open-ui` comme gardien du design system pour toute cartographie, decision composant/variante/page/token, analyse d'impact et modification canonique.
- Utiliser le connecteur ou MCP Figma disponible pour lire semantiquement la cible et obtenir son rendu. Ne pas remplacer silencieusement cet acces par une recherche web ou une interpretation de l'URL.
- Utiliser le navigateur ou Playwright disponible pour verifier le rendu reel apres implementation.
- Charger `rgaa` pour les pages et composants visibles. Distinguer prevention RGAA, controles automatiques et verification humaine.
- Utiliser `design-memory` seulement lorsqu'une decision devient une direction projet durable, pas pour stocker l'etat quotidien du build.

Si le connecteur Figma requis est indisponible, signaler le blocage et demander soit sa connexion, soit une capture et les informations de contexte manquantes. Ne pas inventer les donnees Figma.

## Invariant De Phase

- `open-ui-analyze-figma` observe, cartographie, propose et questionne. Ne pas modifier les composants, pages ou tokens canoniques pendant cette phase.
- `open-ui-implement-figma` implemente uniquement une analyse approuvee. Si l'entree est seulement une URL Figma ou si l'analyse n'est pas approuvee, revenir a la phase d'analyse et s'arreter avant d'ecrire.
- Conserver la posture de gardien : reutiliser un composant, une variante ou une composition avant de creer ; ne pas generaliser un besoin local sans confirmation.

## Artefact D'analyse

Creer un artefact compact dans `.openui/analyses/<slug>.json` en suivant `references/analysis-format.md`.

Utiliser cet artefact comme contrat entre les deux phases :

- conserver la source Figma et la cible exacte ;
- distinguer faits observes, deductions et inconnues ;
- enregistrer le mapping vers la bibliotheque ;
- garder les questions, recommandations et reponses ;
- enregistrer l'approbation et son perimetre ;
- eviter de recopier le graphe complet ou des donnees derivees volumineuses.

## Phase 1 - Analyser Figma

1. Resoudre l'URL Figma vers le fichier, le node et la frame exacts. Si plusieurs cibles sont possibles, demander laquelle analyser.
2. Obtenir le rendu de reference et les donnees disponibles : structure, composants/instances, variantes, auto-layout, contraintes, styles, assets, textes, etats, interactions et frames responsive.
3. Identifier ce qui est explicitement present dans Figma et ce qui serait une inference. Ne pas transformer une absence de specification en decision certaine.
4. Vérifier `.openui/graph.json` avec `npm run graph:check`, le régénérer si nécessaire, puis cartographier le design system depuis cet index compact. Lire les JSON, Twig, Markdown et SCSS seulement pour les candidats pertinents.
5. Classer chaque bloc significatif avec une seule decision provisoire :
   - `reuse` ;
   - `reuse-with-props` ;
   - `new-variant` ;
   - `new-component` ;
   - `page-composition` ;
   - `unknown`.
6. Pour toute variante ou modification d'un composant partage, analyser les usages et les impacts directs et indirects. Signaler les limites du graphe si elles existent.
7. Evaluer les besoins de tokens sans canoniser une valeur propre a une seule maquette. Preferer les tokens existants ; proposer un nouveau token seulement si le besoin est transversal.
8. Relever les etats et comportements necessaires mais absents : hover, focus, actif, disabled, loading, vide, erreur, succes, contenu long et responsive.
9. Formuler uniquement les questions qui peuvent changer la structure, le contrat, l'impact ou l'accessibilite. Donner une recommandation et indiquer si la question bloque l'implementation.
10. Creer ou mettre a jour l'artefact avec le statut `awaiting_confirmation`.
11. Restituer le rendu Figma de reference, le mapping, les risques, les questions et le chemin de l'artefact selon `references/analysis-format.md`.
12. S'arreter. Ne pas commencer l'implementation dans le meme tour sans approbation explicite de l'utilisateur.

## Confirmation

Lorsqu'une reponse utilisateur confirme ou corrige l'analyse :

1. Reporter les reponses dans l'artefact sans reecrire l'historique en prose longue.
2. Mettre a jour les decisions de mapping concernees.
3. Verifier qu'aucune question bloquante ne reste sans reponse.
4. Enregistrer le perimetre approuve et passer le statut a `approved`.
5. Si la confirmation est partielle, garder `awaiting_confirmation` et enumerer uniquement les decisions restantes.

## Phase 2 - Implementer Figma

1. Exiger le chemin ou l'identifiant d'un artefact `approved`. Ne pas se contenter d'une approbation supposee.
2. Relire la cible Figma et recalculer la cartographie utile si le depot ou la maquette a change. Si le mapping n'est plus valable, remettre l'analyse en attente de confirmation.
3. Annoncer le plan d'implementation : reutilisations, variantes, nouveaux composants, page, impacts et validations.
4. Marquer les cibles JSON `in-progress`, puis implementer dans cet ordre :
   - reutilisations et configuration ;
   - variantes confirmees ;
   - nouveaux composants justifies ;
   - composition de la page avec les composants canoniques.
5. Respecter les contrats Open UI : JSON, Twig, Markdown, SCSS, tokens, relations et imports. Ne pas copier le markup d'un composant dans la page.
6. Mettre a jour l'analyse avec les cibles effectivement creees ou reutilisees, sans dupliquer les relations que le graphe peut recalculer.
7. Lancer les validations Open UI proportionnees : JSON, tests, lint SCSS, build et impact des composants partages.
8. Ouvrir le rendu reel et comparer avec la frame Figma de reference : structure, ordre de lecture, dimensions significatives, alignements, espacements, typographie, couleurs, contenus et etats.
9. Corriger les ecarts de mise en oeuvre. Ne pas reproduire une anomalie Figma qui contredit une regle confirmee du design system sans demander un arbitrage.
10. Tester les largeurs observees dans Figma puis les viewports projet. A defaut de configuration, couvrir au minimum mobile, tablette et desktop. Tester aussi contenu long et absence de contenu quand ils sont plausibles.
11. Tester les interactions visibles, le clavier pertinent, le focus et les erreurs console.
12. Executer les controles HTML et Axe disponibles sur les etats representatifs. Ne pas presenter un resultat automatique comme une conformite RGAA.
13. Charger `rgaa`, controler les themes applicables et suivre `references/verification-matrix.md`.
14. Poser les questions RGAA contextuelles restantes. Si une reponse conditionne le HTML, le comportement clavier, le contenu accessible ou l'ordre de lecture, garder le build en `blocked` ou `review`.
15. Boucler raisonnablement : implementer, rendre, comparer, corriger, retester. Ne pas livrer apres une seule capture si un ecart evident subsiste.
16. Passer les cibles JSON à `done` seulement si leurs vérifications réussissent, puis mettre l'artefact a jour avec les preuves et le statut final.
17. Livrer le HTML genere, le bilan des composants, les impacts, les preuves visuelles, les validations et les questions manuelles restantes.

## Protocole De Question

Avant de questionner l'utilisateur :

- chercher la reponse dans Figma, le code, la documentation et le contrat du composant ;
- ne pas demander une preference si une regle technique ou RGAA tranche deja ;
- regrouper les questions par decision, pas par critere ;
- fournir une recommandation concrete ;
- expliquer l'impact d'une absence de reponse ;
- marquer `blocking: true` seulement si l'implementation ou le statut final en depend.

Exemples de questions legitimes : pertinence d'une alternative d'image, comportement du focus apres une erreur ou fermeture de modale, ordre de lecture mobile ambigu, contenu reel d'un message dynamique, statut global ou local d'une nouvelle variante.

## Statuts

Utiliser uniquement :

- `draft` ;
- `awaiting_confirmation` ;
- `approved` ;
- `implementing` ;
- `review` ;
- `blocked` ;
- `done`.

Ne marquer `done` que si l'implementation correspond au perimetre approuve, que les validations obligatoires ont reussi, qu'aucune question bloquante ne reste ouverte et que les limites manuelles sont explicites.

## References

- Lire `references/analysis-format.md` pour creer, mettre a jour et restituer l'analyse.
- Lire `references/verification-matrix.md` pendant la phase d'implementation et avant le verdict final.
