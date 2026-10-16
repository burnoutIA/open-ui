---
description: Intégrer un retour critique utilisateur via MEMORY.md et corriger le livrable
---
Utilise cette commande après une livraison Open UI critiquée par l'utilisateur.

Objectif : transformer le retour critique en apprentissage réutilisable, corriger si nécessaire, et éviter les doublons entre `MEMORY.md` et les skills.

Workflow :

1. Relire la demande initiale, le résultat livré et le retour utilisateur.
2. Vérifier les faits observables dans fichiers, scripts, rendu navigateur ou docs avant de conclure.
3. Classer chaque point en :
   - échec : erreur réelle, oubli, mauvaise décision, vérification insuffisante ;
   - réussite : comportement à reproduire ;
   - réussite améliorable : bonne direction mais finition/cadrage/validation insuffisants ;
   - décision produit : préférence durable ou arbitrage utilisateur.
4. Si le retour demande une correction, l'exécuter avec le workflow Open UI standard.
5. Utiliser `design-critique` si le retour concerne composition, hiérarchie, caractère, densité, interaction ou accessibilité visuelle.
6. Utiliser `design-memory` pour décider :
   - section "Direction stabilisée" de `MEMORY.md` si la décision design est stabilisée ;
   - entrée de provenance dans `MEMORY.md` si c'est un exemple critique, une vigilance ou une cause d'erreur ;
   - skill local si c'est une règle de comportement réutilisable par l'agent.
7. Si une règle est désormais dans la direction stabilisée ou un skill, compacter ou supprimer l'entrée doublon de `MEMORY.md`.
8. Répondre avec corrections faites, apprentissages ajoutés/compactés, validations exécutées, points ouverts.

Format d'entrée si nécessaire :

```markdown
### YYYY-MM-DD — Sujet court

**Contexte**<br>
[Demande initiale + retour critique en une ou deux phrases.]

**À retenir**
- [Décision ou apprentissage non déjà couvert par le skill.]

**Suite utile**
- [Optionnel : correction ou vigilance future.]
```
