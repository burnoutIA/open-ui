---
name: design-sketching
description: Skill local de creation UI en phase amont pour Open UI. A utiliser pour explorer des directions visuelles, produire des sketches, chercher une identite d'interface, generer plusieurs concepts distincts avant design system canonique, ou travailler une commande de type sketch/maquette libre/creative exploration.
---

# Design Sketching

Ce skill sert a explorer avant de stabiliser. Il aide l'agent a produire des directions UI creatives sans tomber dans le rendu IA generique, tout en gardant assez de structure pour que les idees puissent ensuite devenir un design system.

## Posture

- Explorer largement avant de converger.
- Chercher une signature, pas seulement une UI propre.
- Traiter le design system projet comme contexte doux tant que l'utilisateur demande du sketch.
- Respecter les garde-fous du skill `open-ui` : une esquisse reste hors design system canonique tant qu'elle n'est pas consolidée.
- Ne pas transformer une esquisse en composant canonique sans demande explicite.
- Ne pas reprendre le design, le layout, la palette ou les assets d'anciens sketches sauf si l'utilisateur le demande explicitement ou cite ce sketch comme référence.
- Preferer des hypotheses fortes et critiquables a des variantes decoratives.

## Coordination locale

- `open-ui` orchestre le workflow projet, l'impact et l'isolation des esquisses.
- `design-sketching` aide seulement la divergence creative et le langage visuel.
- `design-critique` prend le relais pour choisir, diagnostiquer ou corriger une direction.
- `design-memory` prend le relais apres decision ou retour utilisateur pour mettre a jour `MEMORY.md`.

## Brief minimal

Avant de designer, identifier ou demander uniquement ce qui change vraiment la direction :

- surface : ecran, flow, landing, outil, dashboard, composant, canvas ;
- utilisateur : role, expertise, frequence, pression du moment ;
- moment d'usage : pourquoi l'interface est ouverte maintenant ;
- outcome : decision ou action facilitee ;
- gout vise : calme, dense, premium, editorial, brut, tactile, playful, clinique, technique ;
- contraintes : accessibilite, responsive, integration, marque, design system.

Lire `MEMORY.md` comme overlay projet quand il existe, surtout sa section "Direction stabilisée". Ne pas creer de fichier de direction separe sans demande explicite.

## Divergence

En exploration creative, produire 3 directions par defaut. Produire une seule direction seulement si l'utilisateur le demande explicitement. Chaque direction doit varier au moins deux dimensions parmi :

- composition ;
- densite ;
- navigation ;
- hierarchie typographique ;
- modele d'interaction ;
- rythme visuel ;
- usage des medias ou illustrations ;
- niveau d'expressivite ;
- rapport a la donnees : liste, carte, timeline, canvas, conversation, command palette.

Eviter les variations faibles du type meme layout avec autre couleur.

Pour une exploration de direction artistique, proposer des postures choisissables par un directeur artistique. Ne pas imposer les memes archetypes a tous les projets : deduire les postures du domaine, de l'audience et du moment d'usage.

Axes utiles pour construire ces postures :

- calme / precis / institutionnel ;
- humain / editorial / relationnel ;
- expert / cockpit / haute densite ;
- playful / expressif / exploratoire ;
- brut / technique / utilitaire ;
- premium / minimal / silencieux ;
- tactile / chaleureux / materiel.

Choisir seulement les axes pertinents, les renommer selon le projet, puis garder un meme scenario metier pour comparer les directions.

## Sortie attendue

Pour chaque direction :

- nom court ;
- hypothese produit/utilisateur ;
- principe de layout ;
- langage visuel ;
- idee d'interaction ;
- pourquoi ca peut marcher ;
- risque principal.

Quand du code ou une maquette est produit, marquer le statut comme experimental et l'isoler du design system canonique.

## Anti-generique

Par defaut, eviter :

- gradients violet/bleu dominants sans raison ;
- glassmorphism decoratif ;
- cartes partout ;
- hero marketing pour un outil operationnel ;
- dashboards avec metriques inventees mais aucune decision claire ;
- icones flottantes sans fonction ;
- "modern clean" comme seule direction artistique ;
- beige, slate ou purple monochrome par reflexe ;
- bento grids sans hierarchie ni tension.

## References

- Pour les principes generiques : lire `references/sketch-principles.md`.
- Pour choisir des axes creatifs : lire `references/visual-directions.md`.
- Pour le craft visuel de base (espacement, typo, couleur, surfaces, signaux contemporains) : lire `references/design-craft.md`. Ce fichier est obligatoire pour tout sketch — il encode ce qu'un designer senior applique par défaut.
- Pour transformer une direction retenue en regles projet : utiliser `design-memory`.
