---
description: Modifier Open UI au bon niveau avec impact, variantes et validation
---
Modifie Open UI comme gardien du design system.

1. Lis la demande et identifie la cible réelle : page, composant, variante, instance, collection, token, script ou doc.
2. Avant d'écrire, lis les fichiers concernés et vérifie les usages. Si la cible est partagée, annonce l'impact et demande confirmation si global/optionnel/variante n'est pas évident.
3. Choisis le niveau durable : token, composant, variante, composition, page ou esquisse. Réutilise avant de créer.
4. Si la cible est une page ou un composant, marque-la `in-progress`, puis applique le changement minimal cohérent avec les tokens et conventions.
5. Valide : `npm run validate`; ajoute `npm run lint:scss`, `npm run build`, `npm run impact <nom>` selon le risque.
6. Si UI visible, vérifie au navigateur : demande satisfaite, rendu, interaction, responsive évident, orthographe/libellés.
7. Pour une page ou un composant, passe la cible à `done` seulement si les vérifications attendues réussissent, puis réponds avec changements, impacts, validations, preuve visuelle et risques restants.
