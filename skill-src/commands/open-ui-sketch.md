---
description: Déclencher le tunnel maquette libre / esquisse exploratoire Open UI, hors design system canonique.
---

Utilise cette commande quand l'utilisateur veut explicitement une maquette libre, une exploration visuelle, un brouillon ou un test de direction sans intégrer immédiatement au design system.

## Intention

Produire une esquisse utile pour explorer une direction, pas un composant canonique. Le résultat peut être plus libre, mais doit rester visualisable, lisible et clairement séparé du design system stable.

## Protocole

1. Clarifier l'objectif exploratoire si nécessaire : direction visuelle, type de page/composant, public, contenu minimal, contrainte forte.
2. Avant de designer, fixer une mini-spec en 5 décisions : persona principal, cas d'usage prioritaire, écran livré, ton visuel, composants indispensables.
3. Charger `design-sketching` si la demande implique de la divergence créative ou plusieurs directions.
4. Annoncer que le travail est une esquisse hors DS canonique.
5. Ne pas modifier un composant canonique, un token global ou une convention partagée sans confirmation explicite.
6. Placer les sources HTML/CSS/JS autonomes dans `dev/sketches/<slug>/`. `public/sketches/<slug>/` est uniquement le rendu généré par Vite.
7. Ne jamais livrer un bloc complet HTML/CSS en conversation comme résultat final : le livrable doit être écrit dans les fichiers du sketch.
8. Réutiliser les tokens/patterns existants quand ça aide, mais ne pas brider l'exploration au point de tuer la recherche visuelle.
9. Éviter le dashboard générique : le premier viewport doit contenir au moins 3 éléments spécifiques au métier du produit, impossibles à remplacer sans changer l'application.
10. Vérifier le rendu réel au navigateur si une UI est produite : ouvrir la page, contrôler le contenu visible et prendre une capture.
11. Relire la capture comme un objet visuel, pas seulement le DOM : hiérarchie, rythme, densité, alignements, lisibilité, personnalité, responsive évident, impression générale.
12. Critères de livraison visuelle obligatoires :
   - la page charge sans erreur bloquante ;
   - le contenu principal est visible dans le premier viewport ;
   - la navigation, le header, une sidebar ou une modale ne masquent pas le contenu ;
   - les classes structurelles HTML ont des règles CSS correspondantes ;
   - aucun texte parasite, contenu de debug ou code brut n'est visible ;
   - le screenshot montre clairement le cœur de l'interface, pas seulement le header ou la sidebar.
13. Red flags bloquants :
   - screenshot dominé par la navigation, le header ou la sidebar ;
   - page blanche, quasi vide ou contenu principal sous le fold ;
   - scroll horizontal ;
   - layout écrasé par une sidebar fixe ;
   - header disproportionné ;
   - UI belle mais non spécifique au produit ;
   - aucun état utilisateur ou action métier visible.
14. Si la capture révèle un résultat faible, générique, bancal ou si la vision décrit surtout la navigation/header/sidebar, considérer le rendu comme échoué.
15. En cas d'échec : corriger HTML/CSS, reprendre un screenshot, puis seulement livrer.
16. Livrer seulement après une passe `produire → screenshot → critique → correction` raisonnable, avec les limites explicites si la vision ou le navigateur est indisponible.
17. La sortie finale doit donner un verdict factuel : `livrable visuellement validé` ou `non livrable / à corriger`, avec ce qui est visible dans le premier viewport.
18. Terminer par une section : `À consolider si on garde cette direction`.

## Sortie attendue

- ce qui a été esquissé ;
- où se trouve l'esquisse ;
- preuve visuelle si possible ;
- limites assumées du brouillon ;
- éléments à consolider : composants à extraire, variantes/tokens à créer, impacts à analyser, RGAA à reprendre.

## Anti-déclencheurs

- Ne pas utiliser cette commande pour une modification normale de page/composant.
- Ne pas transformer automatiquement l'esquisse en composant stable.
- Ne pas laisser l'esquisse polluer la liste canonique du design system sans décision utilisateur.
