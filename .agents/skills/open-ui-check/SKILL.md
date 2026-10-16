---
name: open-ui-check
description: "Vérifier cohérence, rendu et validations Open UI"
---

Vérifie l'état Open UI.

1. Inspecte les changements ou la cible demandée.
2. Lance au minimum `npm run validate` si le projet est prêt.
3. Vérifie `npm run graph:check`, puis ajoute `npm run lint:scss`, `npm run build`, `npm run list` ou `npm run impact <nom>` selon le risque.
4. Si une UI visible a changé, ouvre la page au navigateur et vérifie rendu, interaction et libellés.
5. Résume validations passées, impacts, preuve visuelle, échecs et corrections proposées.
