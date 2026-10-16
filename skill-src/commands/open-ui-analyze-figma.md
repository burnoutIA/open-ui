---
description: Analyser une cible Figma avant toute intégration Open UI
argument-hint: "<figma-url>"
---
Utilise les skills `figma-to-open-ui` et `open-ui`.

Prends l'URL Figma fournie en argument, exécute uniquement la phase d'analyse, crée ou mets à jour l'artefact `.openui/analyses/<slug>.json`, puis présente le rendu de référence, le mapping vers la bibliothèque, les impacts et les questions recommandées.

Ne modifie aucun composant, page ou token canonique. Termine avec le statut `awaiting_confirmation` et attends l'approbation explicite de l'utilisateur.
