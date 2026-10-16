# Socle RGAA Operationnel

Le RGAA 4.1.2 est organise en 13 thematiques et 106 criteres de controle. Il s'appuie sur les criteres de succes WCAG 2.1 niveaux A et AA retenus par la norme europeenne de reference.

## Thematique RGAA

1. Images
2. Cadres
3. Couleurs
4. Multimedia
5. Tableaux
6. Liens
7. Scripts
8. Elements obligatoires
9. Structuration de l'information
10. Presentation de l'information
11. Formulaires
12. Navigation
13. Consultation

## Ce Qu'un Agent Peut Bien Faire

- Reperer les erreurs structurelles dans HTML/Twig.
- Verifier les labels, alternatives, relations ARIA, roles, etats et attributs.
- Tester les interactions clavier dans un navigateur.
- Repérer les contrastes suspects et demander/calculer si necessaire.
- Verifier les titres, landmarks, liens, formulaires, tableaux et messages d'erreur.
- Proposer des corrections conformes aux patterns HTML natifs.

## Ce Qui Reste Manuel

- Restitution avec lecteurs d'ecran et technologies d'assistance.
- Pertinence editoriale fine des alternatives et intitules.
- Audit sur echantillon representatif.
- Conformite legale et declaration officielle.
- Validation de contenus externes, documents bureautiques, videos et parcours metier complets.

## Heuristiques Generales

- D'abord le HTML natif : `button`, `a[href]`, `label`, `fieldset`, `legend`, `nav`, `main`, `table`.
- Un controle custom doit exposer nom, role, valeur, etats et clavier.
- Une information transmise par couleur doit aussi exister par texte, icone nommee ou structure.
- Aucun focus ne doit disparaitre.
- Un composant reutilisable doit documenter ce que le consommateur doit fournir : `alt`, label, id, messages, titres, structure.
