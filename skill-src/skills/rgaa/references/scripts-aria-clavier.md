# Scripts, ARIA Et Clavier

Utiliser cette reference pour dropdowns, menus, accordions, tabs, modales, popovers, carrousels, toggles, composants custom et tout comportement JavaScript.

## Regles

- Preferer un element natif (`button`, `details`, `select`, `input`) quand il couvre le besoin.
- Un element cliquable non lien doit etre un `button`.
- Un lien sans navigation reelle ne doit pas etre un `a href="#"`.
- Toute interaction souris doit avoir une alternative clavier.
- Le focus doit etre visible, deplacé de maniere previsible, et jamais piege sauf composant modal avec sortie clavier.
- Les changements d'etat doivent etre exposes : `aria-expanded`, `aria-selected`, `aria-current`, `aria-pressed`, `aria-invalid`, `aria-disabled`, selon le pattern.
- Le nom accessible doit rester stable et utile.

## Points De Controle

- Tab / Shift+Tab parcourent les controles dans un ordre logique.
- Entrée/Espace activent les boutons et toggles.
- Escape ferme menus, popovers, modales si ces composants existent.
- Fleches gerees seulement quand le pattern le demande, sans casser Tab.
- Focus initial et retour focus geres pour modales et panneaux temporaires.
- Aucun `tabindex` positif.
- Pas de `role` ARIA qui contredit l'element natif.

## Documentation Composant

La section Accessibilite d'un composant interactif doit decrire :

- les touches supportees ;
- les attributs ARIA utilises ;
- les etats exposables ;
- les limites d'usage ;
- ce que l'integrateur doit fournir comme label ou contenu.
