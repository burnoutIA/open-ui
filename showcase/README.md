# Open UI Showcase

Le Showcase est l'interface locale de consultation du design system. Il lit les composants canoniques dans `dev/components/` et les pages dans `dev/pages/`, génère tous les contrôles déclarés dans leurs groupes `variants` et `content`, puis demande au serveur Vite un nouveau rendu Twig à chaque modification.

Il fait partie du moteur Open UI et doit rester versionné. Il n'est pas généré depuis `dev/`.

## Lancer

```bash
npm run dev
```

Puis ouvrir `/showcase/` depuis l'index Open UI.

## Frontières

- `showcase/` contient l'outil système suivi par Git.
- `dev/` reste la source locale du projet utilisateur.
- `dev/` peut être absent ou vide : le catalogue expose alors un état de démarrage sans erreur ;
- `dev/assets/scss/style.scss` est chargé par un module virtuel et remplacé par une feuille vide tant que ce fichier n'existe pas ;
- le formulaire du Showcase ne modifie jamais les JSON : ses valeurs sont temporaires ;
- les contrôles `array` avec un schéma `item` utilisent un éditeur de liste avec ajout, suppression et champs nommés ; le JSON brut reste uniquement un repli quand la forme d'un item est indéterminable ;
- le panneau `HTML généré` expose et copie uniquement le dernier HTML effectivement rendu dans l'iframe ; la copie est désactivée pendant une mise à jour ou après une erreur ;
- Axe analyse automatiquement chaque nouveau rendu ; le bouton `Contrôler le rendu` relance Axe et ajoute le Nu HTML Checker sur la variante courante ;
- le catalogue conserve le dernier statut automatique de chaque composant ou page pendant la session et l'invalide lorsque ses props changent ;
- les résultats automatiques restent séparés des vérifications RGAA manuelles et ne doivent jamais être présentés comme une conformité ;
- les relations `parts`, `collections`, `families`, `instances` et `layoutGroups` sont présentées comme contrat de composition ; les contrôles effectivement rendus viennent des groupes `variants` et `content` du composant sélectionné ;
- le rendu live dépend du serveur Vite et n'est pas destiné à fonctionner en `file://`.

## Rendu live

Le shell et l'iframe communiquent par `postMessage`. L'iframe appelle l'API locale de rendu. Un composant est monté comme fragment isolé ; une page est montée comme document complet dans une iframe interne de même origine. Ses scripts et ressources peuvent s'exécuter comme sur la page réelle, tandis que les clics de navigation et soumissions de formulaire déclenchés par l'utilisateur sont neutralisés dans la prévisualisation. Chaque demande porte une révision : le shell ignore une réponse ancienne et n'expose à la copie que le HTML correspondant au rendu courant. Un changement de valeur rerend l'entrée ; un changement de source JSON, Twig ou SCSS passe par le watcher Vite.

## Contrôles qualité

- Axe est importé dans l'iframe et analyse le fragment du composant ou le document complet de la page rendue.
- Le contrôle W3C encapsule un fragment de composant dans un document minimal. Une page complète est envoyée telle quelle, sans second document englobant.
- Pour une page, les contrôles automatiques peuvent notamment couvrir une partie de la structure, de la langue, du titre, des landmarks et des relations ARIA. Le parcours clavier, l'ordre de lecture, les technologies d'assistance et la pertinence éditoriale restent manuels.
- Le service W3C officiel est utilisé par défaut. `OPENUI_W3C_VALIDATOR_URL` permet de cibler une instance locale ou privée.
- Une indisponibilité réseau n'empêche pas Axe de produire son résultat.
- Les contrôles portent sur l'état courant des variables, pas sur toutes les combinaisons possibles.
- Clavier, lecteurs d'écran, pertinence éditoriale, zoom/reflow et contexte réel restent à vérifier manuellement.

Le contrat de démarrage sans `dev/` ni `public/` se vérifie avec `npm run test:empty`.
