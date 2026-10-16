# Images, Icones Et Medias

Utiliser cette reference pour images, avatars, logos, pictogrammes, icones de boutons, illustrations, videos et contenus embarques.

## Images

- Image informative : `alt` pertinent et concis.
- Image decorative : `alt=""` et pas de redondance avec le texte voisin.
- Image lien ou bouton : le nom accessible de l'action doit etre clair.
- Texte en image : a eviter ; sinon alternative equivalente.
- CAPTCHA ou image complexe : alternative ou description adaptee.

## Icones

- Icone decorative dans un bouton avec texte : masquer l'icone aux technologies d'assistance.
- Bouton icone seul : fournir un nom accessible (`aria-label`, texte visuellement masque, ou equivalent).
- Icone transmettant un etat : ne pas se reposer uniquement sur la couleur ou la forme.

## Medias

- Video informative : prevoir sous-titres, transcription ou audiodescription selon le contenu.
- Son automatique : eviter ; sinon controle utilisateur.
- Media externe : signaler les limites si le composant ne controle pas la source.

## Documentation Composant

Documenter qui fournit `alt`, `aria-label`, transcription, sous-titres ou fallback. Un composant generique ne peut pas inventer une alternative pertinente pour tous les usages.
