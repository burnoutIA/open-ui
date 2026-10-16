---
name: rgaa
description: Skill RGAA generaliste base sur la methode officielle RGAA 4.1.2. A utiliser pour prevenir, relire ou corriger l'accessibilite de composants UI, bibliotheques de composants, pages HTML/Twig, formulaires, navigation, scripts/interactions, images, tableaux et contenus. Ne remplace pas un audit legal complet.
---

# Skill RGAA

Ce skill applique une lecture operationnelle du RGAA a des composants et pages web generalistes. Il aide a concevoir, relire et corriger ; il ne certifie pas une conformite RGAA complete.

## Sources officielles

- Methode technique RGAA : https://accessibilite.numerique.gouv.fr/methode/
- Criteres et tests : https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
- Introduction : https://accessibilite.numerique.gouv.fr/methode/introduction/
- Environnement de test : https://accessibilite.numerique.gouv.fr/methode/environnement-de-test/

Base courante a la creation de ce skill : RGAA 4.1.2. La page officielle signale que le RGAA 5 est en cours de redaction avec publication prevue fin 2026 ; cela ne suspend pas les travaux d'accessibilite.

## Posture

- Distinguer prevention RGAA, revue agentique et audit officiel.
- Ne pas promettre "conforme RGAA" sans audit complet, echantillon, environnement de test et verification humaine.
- Travailler sur le code reel : HTML/Twig, CSS/SCSS, JS, rendu navigateur et documentation composant.
- Preferer le natif HTML accessible avant ARIA. ARIA complete une semantique absente ; elle ne repare pas une structure incoherente.
- Pour les composants de bibliotheque, documenter les obligations d'usage : contenu attendu, libelles, alt, associations, contraintes clavier, limites.

## Workflow Rapide

1. Identifier la cible : composant, page, template, interaction JS, formulaire, navigation, tableau, image/media ou contenu.
2. Lire le rendu et les sources concernees.
3. Charger seulement les references utiles :
   - socle et thematiques : `references/socle.md`
   - composants interactifs/scripts : `references/scripts-aria-clavier.md`
   - formulaires : `references/formulaires.md`
   - navigation/structure/page : `references/navigation-structure.md`
   - images/icones/medias : `references/images-icones-medias.md`
   - tableaux/listes : `references/tableaux-listes.md`
   - limites audit vs prevention : `references/audit-vs-prevention.md`
4. Tester ce qui est verifiable : semantique, nom accessible, roles/etats, ordre de titres, focus visible, clavier, erreurs, contrastes evidents, zoom/reflow si pertinent.
5. Classer les constats : `Bloquant`, `A corriger`, `A verifier manuellement`, `Non applicable`.
6. Corriger si la demande appelle une modification ; sinon livrer une revue avec fichiers/lignes, risques et tests manquants.

## Socle Minimal

Tout composant ou page doit au minimum verifier :

- HTML valide et semantique pour l'usage.
- Nom accessible des elements interactifs.
- Focus visible et ordre de focus logique.
- Fonctionnement clavier pour toute interaction.
- Etat, role et valeur perceptibles pour composants custom.
- Contraste suffisant pour texte, etats et focus.
- Labels et aides associes aux champs.
- Erreurs de formulaire identifiables, expliquees et reliees au champ.
- Alternatives aux images informatives ; `alt=""` pour images decoratives.
- Liens explicites hors contexte si possible, ou contexte programmatique fiable.
- Structure de titres et landmarks coherente pour les pages.

## Sortie Attendues

Pour une revue :

```markdown
Bloquant
- [fichier:ligne] Probleme, impact utilisateur, correction proposee, theme RGAA.

A corriger
- ...

A verifier manuellement
- ...

Non applicable / OK notable
- ...
```

Pour une correction :

- annoncer le risque RGAA traite ;
- modifier le minimum de fichiers ;
- mettre a jour la doc composant si le comportement accessible fait partie du contrat ;
- lancer les validations disponibles et signaler ce qui reste manuel.
