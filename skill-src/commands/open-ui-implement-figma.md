---
description: Implémenter une analyse Figma approuvée dans Open UI
argument-hint: "<analyse-slug-ou-chemin>"
---
Utilise les skills `figma-to-open-ui`, `open-ui` et `rgaa`.

Exige un artefact `.openui/analyses/<slug>.json` au statut `approved`. S'il manque ou si une question bloquante reste ouverte, ne modifie pas le design system et reviens à l'analyse.

Marque les cibles JSON `in-progress`, implémente les variantes et composants approuvés, compose la page avec les composants canoniques, vérifie impacts et contrats, compare le rendu à Figma, teste interactions, responsive, HTML et Axe, puis pose uniquement les questions RGAA contextuelles restantes. Passe les cibles à `done` seulement si leurs vérifications réussissent. Livre le HTML généré, les preuves et le verdict `done`, `review` ou `blocked`.
