# Open UI — mémoire projet

Ce fichier est la source locale unique pour la direction design stabilisée, les décisions produit/design et la provenance des retours critiques Open UI.

## Principe

Ne pas créer un deuxième fichier de direction design sans demande explicite. Pour limiter les collisions, `MEMORY.md` contient deux niveaux :

- **Direction stabilisée** : règles et décisions à appliquer au futur travail.
- **Entrées de provenance** : retours concrets, exemples fondateurs et vigilances qui expliquent d'où viennent les règles.

Les skills locaux gardent uniquement les règles de comportement réutilisables par l'agent ; leur format d'installation peut varier selon la plateforme.

Après une demande réalisée puis critiquée par l'utilisateur :

- corriger le livrable si nécessaire ;
- mettre à jour la direction stabilisée ci-dessous si la décision doit guider le futur design ;
- promouvoir les règles de comportement dans le skill local le plus spécifique : `open-ui`, `design-sketching`, `design-critique` ou `design-memory` ;
- garder en entrée de provenance uniquement les cas concrets et vigilances utiles ;
- compacter/fusionner les doublons plutôt que transformer ce fichier en journal.

## Direction stabilisée

### Intention produit

Open UI explore un framework agentique de design/dev UI : l'agent peut concevoir directement dans un workspace de design system, tout en gardant une séparation claire entre composants canoniques et esquisses exploratoires.

### Audience

- Utilisateurs principaux : créateurs/développeurs qui pilotent un agent pour produire des interfaces.
- Niveau d'expertise : technique, sensible au design system, à l'accessibilité et au rendu visuel.
- Fréquence d'usage : itérative, pendant la conception et la consolidation de composants.
- Moment critique : début de projet ou exploration visuelle avant stabilisation.
- Pression dominante : obtenir de bonnes idées sans polluer le design system canonique.

### Principes d'expérience

- Agent-first : la structure doit être lisible et actionnable par un agent.
- Sketch before canon : une idée peut être libre avant d'être transformée en composant durable.
- Design system protected : les composants, tokens et conventions partagés restent protégés par défaut.
- Critique loop : les retours utilisateur doivent devenir des règles utiles, pas un journal infini.
- Visual ambition with control : le mode sketch doit chercher du caractère sans perdre lisibilité, accessibilité et faisabilité.
- Frontière source/rendu : `dev/` contient les sources du projet, y compris `dev/sketches/` pour les esquisses ; `public/` contient le rendu généré, ignoré pendant le développement courant mais conservable pour la production. `public/` n'est jamais la source de vérité.
- Frontière des skills : `skill-src/` est l'unique source éditable ; les dossiers propres à Codex, Copilot, Claude, OpenCode et Pi sont générés uniquement pour la cible demandée et ne doivent pas diverger manuellement.
- Design d'attention pour outils critiques : pour une app médicale ou experte de suivi quotidien, guider le regard vers qui regarder maintenant, pourquoi c'est important, quelle décision prendre et ce qui peut attendre, plutôt qu'exposer tous les modules avec le même poids.

### Langage visuel

- Densité : variable selon le mode ; dense et contrôlée pour le design system, plus expressive en sketch.
- Typographie : à définir par projet ou esquisse.
- Couleurs : à définir par projet ou esquisse ; éviter les palettes IA génériques par défaut.
- Surfaces : éviter la sur-utilisation de cards ; préférer des structures discrètes, implicites ou typographiques qui servent la lecture et l'attention.
- Iconographie : fonctionnelle d'abord.
- Média / illustration : utile en sketch si elle porte l'identité ou le contexte.
- Motion : utile seulement si elle explique une relation, un changement d'état ou une transition.

### Patterns d'interaction

- Navigation : stable et explicite en mode design system.
- Recherche / commande : piste pertinente pour les usages agentiques et experts.
- Sélection : visible, réversible et proche de l'objet manipulé.
- Édition : contextualisée, avec états clairs.
- Édition structurée : dans les outils destinés aux humains, traduire les tableaux et objets en champs nommés et contrôles répétables ; réserver le JSON brut au diagnostic ou aux formes impossibles à déduire.
- Handoff développeur : un outil de design system doit exposer le HTML réellement généré par l'état live, le rendre sélectionnable et copiable, et bloquer la copie tant que le rendu est périmé ou en erreur.
- Feedback : explicite pour loading, erreur, succès, brouillon, statut expérimental.
- États IA : rendre visibles attente, confiance, provenance et action suivante quand applicable.
- États vides / erreur / loading : à prévoir tôt, même en sketch.

### À faire

- Isoler les esquisses dans un tunnel ou emplacement dédié.
- Marquer clairement le statut expérimental d'une maquette libre.
- Produire trois directions par défaut en exploration créative ; produire une seule direction si l'utilisateur le demande explicitement.
- Pour une exploration DA, proposer des postures vraiment choisissables et adaptées au domaine, pas des variantes de palette.
- Relire les screenshots comme un designer : densité, hiérarchie, trous, responsive, rythme.
- Extraire les composants, variantes et tokens seulement après sélection d'une direction.

### À éviter

- Transformer une esquisse en composant canonique sans consolidation.
- Modifier des tokens ou composants partagés pendant un sketch sans confirmation.
- Reprendre le design d'anciens sketches sauf demande explicite ou référence claire de l'utilisateur.
- Faire du "modern clean" générique.
- Ajouter des cartes, gradients ou effets visuels sans rôle produit.
- En plein écran, utiliser une structure trop visible type chrome applicatif + panneaux/cards systématiques : cela vieillit vite le rendu et peut évoquer le web des années 2008.
- Pour les outils médicaux ou experts, produire un dashboard de cards quand le besoin réel est un design d'attention orienté décision.
- Garder des apprentissages en doublon entre `MEMORY.md` et les skills.

### Questions ouvertes

- Quel statut utiliser dans les données : `draft`, `sketch`, `canonical` ?
- Comment promouvoir une esquisse sans laisser de dette ou de composants morts ?
- Faut-il inclure les esquisses dans les commandes de listing ?

## Entrées


### 2026-05-24 — Cadrage insuffisant avant création de contenu UI

**Contexte**  
Sur une demande de page/listing avec cards, filtres et actions, le résultat pouvait être correct visuellement mais trop improvisé faute de cadrage préalable.

**À retenir**
- Quand une demande ne précise pas les données, critères de filtres, actions des cards ou périmètre, il faut prendre un tour pour cadrer au lieu de combler les vides.
- Une page correcte ne suffit pas si les choix produit structurants ont été inventés sans validation utilisateur.

**Suite utile**
- La règle de cadrage est intégrée dans le skill local `open-ui` : repérer les vides produit et poser les questions minimales avant d'implémenter.

### 2026-05-24 — Exemples fondateurs de la boucle critique

**Contexte**  
Les premiers retours critiques ont porté sur deux cas : ajout d'un champ `Tél. fixe` dans la page formulaire, puis ajout d'une bascule clair/sombre dans `header-nav`.

**À retenir**
- Le champ `Tél. fixe` a validé le bon niveau de modification pour une page : réutiliser `input`, ajouter l'instance dans `form.json`, adapter la grille responsive, puis vérifier visuellement.
- Le wording email a établi une préférence : ne pas ajouter des aides inutiles pour équilibrer une grille ; préférer une microcopy plus courte et utile.
- La bascule clair/sombre a révélé un risque produit : `header-nav` est partagé par `form` et `listing`; une demande sur le menu peut nécessiter une confirmation global/optionnel/variante avant modification.

**Suite utile**
- Les règles de comportement issues de ces retours sont maintenant dans le skill local `open-ui`; ne pas les dupliquer ici sauf nouveau cas concret.

### 2026-05-28 — Tunnel maquette libre séparé

**Contexte**  
Open UI doit pouvoir produire de jolies maquettes exploratoires, mais ce n'est pas le comportement par défaut : le mode normal reste la protection du design system.

**À retenir**
- Le déclencheur privilégié pour une maquette libre est une commande dédiée, `/open-ui-sketch`.
- Une maquette libre est du brouillon : elle doit rester dans un tunnel séparé et ne pas être gardée dans le design system canonique sans consolidation.
- La consolidation doit venir ensuite si la direction est retenue : extraction de composants, variantes, tokens, impacts et accessibilité.

**Suite utile**
- La règle de séparation sketch/design system est intégrée dans la direction stabilisée, le skill local `open-ui` et `docs/sketches.md`; cette entrée sert seulement de provenance.

### 2026-05-28 — Relecture visuelle d'une esquisse santé

**Contexte**  
La première esquisse de page d'accueil praticiens santé avait une bonne direction visuelle (fonts, couleurs, sidenav), mais la capture révélait des défauts de finition : trous responsive, vides disgracieux dans certains blocs et titre mal utilisé dans l'espace disponible.

**À retenir**
- En mode sketch, une bonne direction esthétique ne suffit pas : il faut aussi resserrer la composition, contrôler les ruptures responsive et traquer les zones vides qui donnent une impression de maquette inachevée.
- Les screenshots doivent être relus comme un designer : distribution de l'espace, densité des cards, proportion des titres, colonnes et respiration globale.
- Une correction propre peut rester trop scolaire : en mode sketch, il faut parfois proposer une direction plus éditoriale, plus assumée ou plus risquée, surtout si l'objectif est d'explorer une identité visuelle.

**Suite utile**
- La version corrigée resserre le hero, empile les panneaux secondaires, élargit le titre principal et améliore les breakpoints intermédiaires.
- Prochaine itération possible : tenter une variante plus audacieuse sans perdre le sérieux médical, par exemple composition plus asymétrique, carte patient prioritaire plus incarnée, sidebar plus distinctive, ou système d'alertes moins dashboard standard.

### 2026-05-29 — Directions DA santé vraiment distinctes

**Contexte**  
Après suppression des anciens sketches santé, l'utilisateur a demandé trois directions réellement choisissables par un directeur artistique : calme/clinique, éditoriale/humaine et expert/cockpit.

**À retenir**
- L'agent avait d'abord repris le design d'anciens sketches ; ce comportement est à éviter quand l'utilisateur ne cite pas ces sketches comme référence.
- Pour une exploration DA, ne pas proposer trois palettes d'une même structure : varier aussi composition, densité, typographie, modèle d'interaction et rôle du parcours patient.
- Les trois pistes ne doivent pas être fusionnées trop tôt ; elles servent à choisir une posture produit/DA.
- Le même scénario clinique doit être projeté dans chaque direction pour comparer lisiblement les choix.

**Suite utile**
- La règle normative est ajoutée dans la direction stabilisée et `design-sketching`.
- Sketch créé dans `dev/sketches/health-art-directions/`, publié dans `public/sketches/health-art-directions/`.

### 2026-05-29 — Plein écran santé : structure trop visible

**Contexte**  
Sur trois propositions HTML pour une app santé, les directions étaient différentes en surface mais reposaient sur la même stratégie visuelle : page occupée par un chrome applicatif lourd, panneaux très visibles et cartes. L'utilisateur a jugé que cela produisait immédiatement un effet daté, proche web 2008.

**À retenir**
- Une interface plein écran ne doit pas nécessairement remplir l'espace par des blocs visibles ; elle peut reposer sur des lignes, colonnes implicites, typographie, blancs et hiérarchie.
- Si trois directions DA sont demandées, varier aussi le niveau de visibilité de la structure : grille documentaire, page éditoriale, matrice experte, etc.
- Éviter de répliquer sidebar + topbar + cards sur toutes les pistes.

**Suite utile**
- La direction stabilisée rappelle d'éviter le chrome applicatif lourd en plein écran.
- Les trois HTML ont été repris dans `dev/sketches/health-da-three-directions/` avec une structure plus dissoute.

### 2026-05-29 — Design d'attention validé pour app santé

**Contexte**  
Après comparaison entre les premières propositions dashboard et les versions plus dissoutes, l'utilisateur a validé que le design d'attention était beaucoup plus intéressant.

**À retenir**
- Pour une app médicale de suivi quotidien, l'interface doit orienter le regard plutôt qu'exposer des modules équivalents.
- La priorité de lecture est : qui regarder maintenant, pourquoi c'est important, quelle décision prendre, ce qui peut attendre.
- La richesse visuelle vient de la hiérarchie, du rythme, du vide, des lignes et de la typographie, pas de l'accumulation de cartes.

**Suite utile**
- Règle ajoutée dans la direction stabilisée : privilégier le design d'attention pour les outils critiques/médicaux.
