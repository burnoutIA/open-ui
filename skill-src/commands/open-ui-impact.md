---
description: Analyser les impacts Open UI avant changement
---
Analyse l'impact avant modification.

1. Clarifie l'élément touché et le type de changement attendu.
2. Vérifie l'index avec `npm run graph:check`, puis cherche les usages composants/pages via `.openui/graph.json` et `npm run impact <nom>` ; complète par une lecture directe seulement pour les nœuds concernés.
3. Distingue les options : changement global, prop optionnelle, variante dédiée, patch page/local ou esquisse.
4. Signale pages/composants/tokens touchés, risques visuels/a11y, validations nécessaires.
5. Si l'impact dépasse une page ou l'intention est ambiguë, arrête-toi et demande validation avant d'écrire.
