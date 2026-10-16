---
name: open-ui-consolidate-sketch
description: "Consolider une esquisse retenue en composant, variante, page, token ou pattern canonique Open UI."
---

Utilise cette commande quand l'utilisateur veut transformer une esquisse ou une direction retenue en production.

## Intention

Faire passer une maquette libre par un sas de consolidation avant integration au design system canonique. Le but n'est pas de copier le sketch, mais d'en extraire un contrat durable.

## Protocole

1. Charger le skill `sketch-to-production`.
2. Identifier la source : sketch, direction, fichier, capture ou retour utilisateur.
3. Relire la section "A consolider si on garde cette direction" si elle existe.
4. Cartographier les composants, variantes, tokens et pages proches.
5. Decider le niveau d'integration : composant canonique, variante, composition, page locale, token ou pattern documente.
6. Annoncer la decision et les impacts si le changement est transversal.
7. Implementer avec les garde-fous `open-ui` : fichiers attendus, docs, imports, impact, validations.
8. Appliquer `rgaa` pour toute UI interactive, formulaire, navigation, tableau, media ou page complete.
9. Verifier visuellement le rendu navigateur.
10. Utiliser `design-memory` si la direction devient une decision projet durable.

## Sortie attendue

- source consolidee ;
- choix d'integration ;
- changements effectues ;
- impacts et validations ;
- preuve visuelle si disponible ;
- ce qui reste volontairement hors production.

## Anti-declencheurs

- Ne pas utiliser pour explorer de nouvelles directions : utiliser la commande `open-ui-sketch`.
- Ne pas utiliser pour une correction ordinaire d'un composant deja canonique : utiliser la commande `open-ui-modify`.
- Ne pas promouvoir une esquisse sans decision utilisateur claire.
