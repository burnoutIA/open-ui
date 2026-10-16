# Design Craft

Connaissances de métier à appliquer par défaut en sketch. Ces règles ne décrivent pas un style — elles décrivent ce qu'un designer senior fait sans y penser en 2025-2026.

---

## Espacement et rythme

Travailler sur une grille de 4px. Les valeurs utilisables sont 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

Ne jamais mélanger deux grilles sur un même écran. Un composant à 20px de padding interne et une section à 24px de margin créent une tension invisible mais perçue.

La densité se lit dans les espaces, pas dans la taille des éléments. Pour faire respirer un écran, augmenter l'espace entre les groupes (espacement interbloc), pas l'espace interne des composants.

Règle de proximité : ce qui est proche est lié. Si deux éléments sont à 8px l'un de l'autre et le suivant à 24px, l'œil groupe automatiquement les deux premiers. Utiliser ça pour construire la hiérarchie sans trait ni fond.

L'espacement doit être cohérent au sein d'un même niveau. Les éléments de même rang hiérarchique ont le même espacement entre eux.

---

## Typographie comme hiérarchie

Maximum 3 niveaux de taille dans une même vue. Plus de 3 niveaux : la hiérarchie s'effondre.

Différencier les niveaux par au moins deux vecteurs parmi : taille, graisse, couleur, espacement, capitalisation. Un seul vecteur ne suffit pas.

Les tailles qui donnent une impression actuelle en interface : 13-14px corps, 11-12px méta, 17-20px titre secondaire, 24-32px titre principal. En dessous de 13px dans un corps de texte : faiblesse d'accessibilité et impression bon marché.

Ne pas utiliser plus de deux graisses pour le corps du texte (regular + medium ou regular + semibold). Bold réservé aux titres ou alertes critiques.

Line-height : 1.4 à 1.6 pour le corps, 1.1 à 1.3 pour les titres. Moins de 1.1 sur plusieurs lignes : illisible. Plus de 1.7 sur corps court : aéré mais peu crédible.

Letterspacing négatif sur les grands titres (-0.5% à -2%) : marque de soin. Letterspacing positif sur les majuscules ou labels courts : lisibilité. Ne jamais espacer positivement un texte de taille normale.

---

## Couleur fonctionnelle

La couleur doit toujours accomplir quelque chose : indiquer l'état, guider l'attention, marquer l'appartenance, signaler le danger.

Règle des 60-30-10 comme point de départ : 60% surface neutre, 30% couleur secondaire ou structurante, 10% accent. En pratique : plus l'interface est fonctionnelle (outil, dashboard), plus le ratio penche vers le neutre.

Une couleur d'accent trop présente perd sa valeur de signal. Si tout est bleu, rien n'est important.

Les palettes actuelles privilégient : fond légèrement teinté plutôt que blanc pur, gris avec température (légèrement chaud ou froid selon le domaine), un seul accent saturé sur fond désaturé.

Les états interactifs doivent être distinguables sans couleur (pour l'accessibilité) : forme, position, icône, underline, fond.

Ne pas inventer une palette complète pour un sketch. Partir de : un neutre (gris chaud ou froid), un accent, noir texte, blanc ou off-white fond. Ajouter une couleur sémantique (vert succès, rouge erreur) seulement si un état le demande.

---

## Surfaces, fonds et profondeur

L'élévation se construit par la valeur (clair vs foncé), pas par les ombres. Réserver les ombres aux éléments flottants réels : modales, popovers, tooltips, dropdowns.

Une card avec une ombre portée forte sur un fond blanc : convention 2015. En 2025 : séparation par valeur de fond (fond légèrement plus foncé ou plus clair), ou border fine (1px, opacité 8-15%).

Les ombres actuelles quand elles existent : diffuses, basses, faible opacité. `0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)`. Pas de noir pur ni de flou fort.

Glassmorphism : à éviter sauf si la surface derrière a une valeur narrative. Un fond flou sur fond blanc : aucun effet. Réserver au contexte où l'on voit vraiment quelque chose à travers.

Border-radius : dépend du registre visuel.
- 0-2px : brut, technique, expert.
- 4-6px : professionnel sobre.
- 8-12px : standard, SaaS B2C.
- 16px+ : doux, friendly, grand public.
Cohérence : ne pas mélanger des radius radicalement différents dans un même composant.

---

## Layouts et composition

Aligner sur une colonne de référence. Même en responsive, définir un point d'ancrage optique (souvent à gauche ou centré sur max-width 1200-1440px).

La règle des tiers s'applique aux layouts de page : l'information principale dans le tiers central ou supérieur gauche, le contexte autour.

Éviter la symétrie parfaite sur les layouts éditoriaux et les landings — elle donne une impression statique. Alternance, décalage contrôlé, tension asymétrique : c'est ce qui retient l'œil.

Pour les outils et dashboards, au contraire : aligner strictement. L'asymétrie dans un outil crée de l'anxiété.

Blank states : concevoir dès le sketch l'état vide, l'état partiel et l'état plein. Un composant dessiné uniquement avec des données parfaites n'est pas crédible.

---

## Interactions et feedback

Chaque action doit avoir une réponse perceptible dans un délai de 100ms (visuel immédiat), même si le résultat prend plus longtemps.

Les états à représenter dès le sketch : repos, hover/focus, actif/pressed, désactivé, loading, succès, erreur. Une maquette sans états est incomplète.

Les micro-interactions actuelles qui donnent de la valeur : transition d'état sur les boutons (pas juste changement de couleur, mais léger déplacement ou scale), skeleton loading plutôt que spinner pour les blocs de contenu, animation de confirmation courte (200-300ms) sur les actions destructives.

Motion utile : n'anime que ce qui préserve le contexte ou explique une relation. Entrée de modal depuis le bas (mobile), panel qui glisse du côté où il se trouve, élément qui suit le curseur vers sa destination.

---

## Signaux d'une interface datée (à éviter)

Ces éléments déclenchent une perception "années 2010" :

- Gradient violet-bleu sans motivation narrative.
- Ombre forte + border-radius 8px + fond blanc = card 2016.
- Hero avec image plein-écran + texte centré + CTA unique.
- Dashboard avec 6 KPI cards identiques en haut.
- Icônes colorées flottantes sans fonction.
- Navigation avec icônes + labels centrés et fond coloré.
- Formulaire pleine page sur fond gris clair avec border grise.
- Bouton avec gradient horizontal.
- Badge "NEW" ou "BETA" en rouge vif sur tout.
- Fond de page blanc pur (#ffffff) avec éléments en gris clair (#f5f5f5) : pas de profondeur.

---

## Signaux d'une interface actuelle (2025-2026)

- Fond légèrement teinté ou off-white (ex: #fafaf8, #f9f9fb).
- Typographie avec personnalité : variable font, serif de titre dans un outil, ou contraste fort regular/light.
- Densité calme : peu d'éléments mais bien placés, espacement généreux entre groupes.
- Un seul accent chromatique, le reste neutre.
- Séparation par valeur plutôt que par trait.
- Interaction au niveau du contenu : cliquer directement sur un champ de texte pour l'éditer, glisser un élément pour le déplacer.
- Loading states dessinés (skeleton, pulse) plutôt que spinner générique.
- Navigation secondaire dans un rail gauche fin ou en command palette.
- Données temps réel intégrées au flux (pas dans une section dédiée).
- Vide géré avec intention : message utile, action suggérée, pas juste "No data found".

---

## Checklist rapide avant de valider un sketch

- L'œil sait où aller en premier ? (hiérarchie)
- L'action principale est-elle évidente sans lire tous les labels ?
- Y a-t-il un état vide et un état d'erreur visibles ?
- Les espacements sont-ils cohérents sur une grille de 4 ou 8 ?
- L'accent couleur est-il utilisé une seule fois pour une seule intention ?
- Le composant le plus dense est-il encore lisible à 80% de zoom ?
- Un utilisateur daltonien comprend-il les états sans couleur ?
