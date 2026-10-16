# Tableaux Et Listes

Utiliser cette reference pour data tables, listings, rows, cards repetitives, menus de resultats et grilles.

## Tableaux De Donnees

- Utiliser `table` pour des donnees tabulaires, pas une grille CSS de `div`.
- Les cellules d'en-tete sont des `th`.
- Les relations en-tete/cellule sont explicites si le tableau est complexe (`scope`, `headers`/`id`).
- Un titre ou une description explique le tableau si necessaire.
- Les actions par ligne ont des noms accessibles contextualises.

## Tableaux De Mise En Page

- A eviter. Si present, ne pas exposer de semantics de tableau inutiles.

## Listes Et Cards

- Une vraie liste repetitive devrait utiliser `ul`/`ol`/`li` si l'information est listable.
- Les cards cliquables doivent avoir une cible interactive claire.
- Eviter les liens dupliques avec le meme libelle vers des cibles differentes.
- Les actions "voir", "ouvrir", "modifier" doivent inclure un contexte accessible.

## Points De Controle

- Navigation clavier utilisable dans chaque item.
- Ordre de lecture coherent.
- Etats selectionne/actif/expendu exposes si presents.
- Aucun contenu essentiel seulement visible au hover.
