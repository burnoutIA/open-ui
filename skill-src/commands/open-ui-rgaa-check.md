---
description: Verifier une cible Open UI avec le skill RGAA
---
Verifie une cible Open UI avec la vision RGAA generaliste.

1. Cartographie la cible Open UI : page, composant, variante, instance, template ou token touche.
2. Identifie les composants/pages impactes avec lecture directe et `npm run impact <nom>` si pertinent.
3. Utilise le skill `rgaa` : composant -> `rgaa-check-component`, page/template -> `rgaa-check-page`, diff -> `rgaa-review`.
4. Relie les constats RGAA au modele Open UI : faut-il corriger le composant canonique, une variante, la page, la doc ou un usage consommateur ?
5. Valide avec les commandes Open UI adaptees et reponds avec impacts design system, risques RGAA, validations et limites manuelles.
