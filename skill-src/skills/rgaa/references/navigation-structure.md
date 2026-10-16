# Navigation Et Structure

Utiliser cette reference pour pages, templates, headers, footers, breadcrumbs, menus, layouts et documents HTML.

## Structure De Page

- Une langue de page est definie avec `lang`.
- Le titre de page est explicite.
- La page expose un contenu principal identifiable (`main` ou role equivalent).
- Les titres suivent une hierarchie logique sans saut artificiel.
- Les regions de navigation ambigues ont un nom accessible (`aria-label`).
- Les liens d'evitement existent si la page a une navigation repetee.
- L'ordre DOM reste coherent avec l'ordre visuel et le parcours clavier.

## Navigation

- Le lien courant est indique avec `aria-current` quand pertinent.
- Les menus ouvrants exposent `aria-expanded` et `aria-controls` si un panneau est pilote.
- Les breadcrumbs utilisent une liste ordonnee et signalent la page courante.
- Les libelles de liens sont suffisamment explicites ; si le contexte est necessaire, il doit etre programmatique.

## Presentation

- L'information ne depend pas uniquement de la position, forme, taille ou couleur.
- Le zoom et les largeurs reduites ne doivent pas masquer du contenu ou imposer un scroll horizontal global non justifie.
- Les contenus caches doivent l'etre proprement : visible pour lecteurs d'ecran si necessaire, `hidden`/`aria-hidden` seulement si absent de tous.
