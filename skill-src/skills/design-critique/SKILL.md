---
name: design-critique
description: Skill local de critique UI/UX pour Open UI. A utiliser pour relire une maquette, screenshot, prototype, page ou composant; identifier pourquoi un design semble generique, bancal ou reussi; scorer des directions; proposer corrections et apprentissages reutilisables.
---

# Design Critique

Ce skill transforme une impression visuelle en diagnostic actionnable. Il sert a choisir entre directions, corriger une maquette, ou extraire des regles a memoriser.

## Posture

- Dire ce qui marche avant de corriger seulement si cela aide la decision.
- Prioriser les problemes visibles, pas les preferences abstraites.
- Distinguer : bug UI, faiblesse de composition, mauvais fit produit, gout subjectif, dette de systeme.
- Ne pas confondre proprete et qualite : une UI peut etre propre mais sans caractere.

## Coordination locale

- `design-critique` diagnostique et recommande.
- `open-ui` reste responsable des corrections codees, validations, impact et RGAA.
- `design-memory` reste responsable de la promotion vers `MEMORY.md` ou un skill.
- Ne pas ecrire directement des regles en double dans `MEMORY.md` si elles appartiennent deja a un skill.

## Grille rapide

Evaluer sur 1 a 5 si utile :

- Clarite : l'utilisateur comprend-il quoi faire et pourquoi ?
- Hierarchie : l'oeil tombe-t-il sur les bons elements dans le bon ordre ?
- Fit produit : la forme correspond-elle au contexte d'usage ?
- Distinction : y a-t-il une signature ou seulement un rendu generique ?
- Densite : l'information est-elle ni trop pauvre ni trop chargee ?
- Rythme : espacements, alignements, tailles et contrastes tiennent-ils ensemble ?
- Interaction : les actions, etats et feedbacks sont-ils evidents ?
- Accessibilite : contraste, focus, labels, tailles, ordre logique.
- Faisabilite : la direction peut-elle devenir composants/tokens sans bricolage ?

## Diagnostic

Commencer par les 3 observations les plus importantes. Pour chaque observation :

- symptome visible ;
- cause probable ;
- correction concrete ;
- risque si on ne corrige pas.

Quand plusieurs directions existent, recommander une direction ou une hybridation avec raison produit.

## Anti-biais

- Ne pas recommander "plus moderne" sans dire quel levier change.
- Ne pas ajouter des cartes pour organiser si le vrai probleme est la hierarchie.
- Ne pas recommander plus de couleur si le probleme est la structure.
- Ne pas sacrifier lisibilite et accessibilite pour une tendance.
- Ne pas pousser l'originalite si l'utilisateur a besoin de vitesse, confiance ou conformite.

## Sortie attendue

Pour une critique courte :

1. verdict ;
2. points forts ;
3. problemes prioritaires ;
4. corrections proposees ;
5. apprentissages a noter.

Pour une revue de screenshot ou UI codee, inclure si possible une verification responsive et etats importants.

## References

- Pour la grille complete : lire `references/critique-rubric.md`.
- Pour convertir les retours en memoire : utiliser `design-memory`.
