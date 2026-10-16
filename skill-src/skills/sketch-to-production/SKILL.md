---
name: sketch-to-production
description: Skill local de consolidation UI pour Open UI. A utiliser quand une esquisse, maquette libre ou direction retenue doit devenir un composant, une variante, une page ou des tokens de production dans le design system canonique.
---

# Sketch To Production

Ce skill gere le sas entre exploration et design system. Il sert a transformer une intention validee en implementation durable sans copier le brouillon tel quel.

## Posture

- Consolider une direction retenue, pas continuer a diverger.
- Preserver l'idee forte du sketch, mais jeter les raccourcis experimentaux.
- Decider explicitement ce qui devient composant, variante, token, composition ou simple usage page.
- Ne jamais promouvoir une esquisse sans demande explicite ou decision claire de l'utilisateur.
- Ne pas faire entrer de styles experimentaux, donnees factices ou helpers locaux dans le design system canonique.
- Traiter la promotion comme un changement de production : impact, RGAA, docs, tests, verification visuelle.

## Coordination locale

- `design-sketching` produit les directions et les brouillons.
- `design-critique` aide a choisir ou corriger la direction avant consolidation.
- `sketch-to-production` traduit la direction retenue en contrat durable.
- `open-ui` execute l'integration canonique : composants, variantes, tokens, impact, validations.
- `design-memory` garde la decision retenue et les apprentissages projet dans `MEMORY.md`.

## Declencheurs

Utiliser ce skill quand l'utilisateur dit par exemple :

- "on garde ce sketch" ;
- "passe cette maquette en composant" ;
- "industrialise cette direction" ;
- "transforme ce brouillon en production" ;
- "integre cette piste dans le design system" ;
- "consolide l'esquisse".

Ne pas utiliser ce skill pour une simple modification de composant deja canonique : utiliser `open-ui`.

## Entree minimale

Avant de consolider, identifier :

- le sketch ou la direction source ;
- la surface cible : composant, variante, page, layout, token, pattern ;
- les usages prevus : unique, recurrent, partage, projet specifique ;
- les etats requis : vide, loading, erreur, actif, disabled, hover/focus, succes ;
- les contraintes de contenu reel ;
- les criteres d'accessibilite et de responsive ;
- ce qui doit etre conserve du sketch : composition, rythme, interaction, ton, couleur, densite ;
- ce qui est jetable : donnees factices, decoration, code local, raccourcis CSS, libelles temporaires.

Si la direction source n'est pas claire, demander la precision minimale avant d'ecrire.

## Protocole de consolidation

1. Relire le sketch et sa section "A consolider si on garde cette direction".
2. Extraire l'intention durable : probleme utilisateur, action principale, hierarchie, interaction distinctive.
3. Faire l'inventaire des pieces existantes dans Open UI : composants proches, variantes, parts, collections, tokens, pages utilisatrices.
4. Choisir le niveau d'integration :
   - composant canonique ;
   - variante d'un composant existant ;
   - composition de composants ;
   - page locale ;
   - token ou convention ;
   - pattern documente sans nouveau code.
5. Reduire le sketch en contrat de production :
   - API Twig/JSON ;
   - props et variantes ;
   - slots/parts/collections ;
   - etats ;
   - tokens necessaires ;
   - contraintes responsive ;
   - comportement clavier/focus ;
   - documentation.
6. Implementer avec le skill `open-ui`, pas en copiant les fichiers experimentaux.
7. Appliquer le socle RGAA selon la cible, avec le skill `rgaa` pour interaction, formulaire, navigation, tableau, media ou page complete.
8. Verifier impact, validations et rendu navigateur.
9. Mettre a jour `MEMORY.md` via `design-memory` si la direction devient une decision projet.

## Regles de traduction

- Remplacer les valeurs magiques par des tokens existants ou proposer un token si le besoin est transversal.
- Transformer les donnees parfaites du sketch en exemples credibles : etat vide, etat partiel, contenu long, erreur.
- Garder une seule idee visuelle forte. Si tout devient token, variante et option, c'est probablement trop large.
- Preferer une variante si le comportement reste celui d'un composant existant.
- Creer un composant seulement si la structure, l'usage ou le contrat merite une unite durable.
- Documenter les limites : ce qui a ete stabilise, ce qui reste experimental, ce qui a ete abandonne.

## Anti-patterns

- Copier-coller la maquette dans `dev/components` avec un nouveau nom.
- Canoniser une couleur, une ombre ou un radius parce qu'ils etaient jolis dans un seul sketch.
- Ajouter des props pour chaque detail du brouillon.
- Garder des textes inventes qui masquent les vrais cas limites.
- Oublier les etats non visibles dans le sketch.
- Confondre "direction retenue" et "implementation terminee".

## Sortie attendue

Pour une consolidation, repondre avec :

- source consolidee ;
- decision d'integration : composant, variante, page, token, composition ou pattern ;
- fichiers modifies ou crees ;
- impacts analyses ;
- validations lancees ;
- verification visuelle ;
- points restants ou choix abandonnes du sketch.
