# Promotion d'une esquisse vers le canonique

## Intention

Cette procédure sert à transformer une esquisse située dans `dev/sketches/` en composant, pattern ou page canonique sans polluer le design system. La promotion n'est pas une copie : c'est une consolidation après critique, sélection et vérification.

## Quand promouvoir

Promouvoir seulement si l'esquisse répond à au moins un de ces critères :

- elle résout un besoin produit récurrent ou structurant ;
- elle introduit un pattern réutilisable plutôt qu'un écran isolé ;
- elle a été sélectionnée explicitement après comparaison ou critique ;
- elle améliore la hiérarchie, l'attention, l'accessibilité ou la clarté par rapport à l'existant ;
- ses dépendances visuelles peuvent être exprimées en composants, variantes ou tokens maintenables.

## Critères de refus

Refuser ou reporter la promotion si :

- l'esquisse est seulement décorative ou liée à un cas ponctuel ;
- la direction n'a pas été choisie clairement ;
- elle nécessite de modifier des tokens globaux sans justification d'impact ;
- elle duplique un composant existant sans variante utile ;
- l'état clavier, focus, erreur, vide, chargement ou responsive n'est pas concevable ;
- elle dégrade la lisibilité, la hiérarchie ou les contrastes ;
- les impacts sur les composants/pages existants ne sont pas compris.

## Séquence de promotion

### 1. Identifier la source

- Localiser l'esquisse dans `dev/sketches/`.
- Noter le contexte : objectif, cible, écran ou interaction testée.
- Vérifier qu'elle n'a pas déjà modifié des composants canoniques ou tokens partagés.

### 2. Critiquer avant d'extraire

Passer l'esquisse en revue comme un designer, pas seulement comme du code :

- hiérarchie de lecture : quoi regarder d'abord, ensuite, et pourquoi ;
- densité : informations utiles vs bruit visuel ;
- rythme : espacements, alignements, ruptures ;
- rôle des surfaces : éviter les cards décoratives ou redondantes ;
- robustesse : contenus longs, listes vides, erreurs, états extrêmes ;
- adéquation domaine : ton, niveau de confiance, criticité, fatigue attentionnelle.

La critique doit produire une décision : garder, ajuster, fusionner avec l'existant ou abandonner.

### 3. Choisir le bon niveau canonique

Déterminer ce qui est promu :

| Source dans l'esquisse | Cible canonique probable |
|---|---|
| Élément indivisible | Atom dans `dev/components/[name]/` |
| Assemblage réutilisable court | Molecule |
| Bloc fonctionnel complet | Organism |
| Structure de page sans données réelles | Template |
| Écran concret | Page dans `dev/pages/`, idéalement appuyée par des composants |
| Règle de composition répétable | Pattern documenté + composants associés |

Ne pas promouvoir tout l'écran si seule une interaction ou un bloc est réutilisable.

### 4. Extraire le contrat

Avant de coder, définir :

- nom en `kebab-case` ;
- niveau atomic design ;
- usage et limites ;
- props de contenu ;
- variantes visuelles ou comportementales ;
- sous-composants réutilisés ;
- états : défaut, hover, focus, actif, disabled, erreur, succès, loading, vide ;
- données longues, absentes ou multiples ;
- dépendances éventuelles aux tokens.

### 5. Gérer les tokens

Créer ou modifier un token seulement si la valeur est réutilisable et nommable par intention.

Checklist tokens :

- utiliser les tokens existants d'abord ;
- éviter d'ajouter une couleur ou ombre pour une seule esquisse ;
- nommer par rôle (`attention`, `critical`, `surface-muted`) plutôt que par apparence ;
- documenter l'impact si un token existant change ;
- ne jamais modifier les tokens globaux pendant une promotion sans analyse d'impact.

### 6. Construire la version canonique

Pour un composant dans `dev/components/[name]/`, créer ou mettre à jour :

- `[name].json` : source de vérité, métadonnées, contrôles, defaults ;
- `[name].twig` : rendu sans logique métier ;
- `[name].md` : usage, props, accessibilité, exemples ;
- les styles selon le mode configure : `_[name].scss` importe dans le point d'entree (SCSS) ou classes utilitaires dans le Twig (Tailwind).

Réutiliser les composants existants avant d'en créer de nouveaux.

### 7. Vérifications RGAA et design

Points de contrôle minimum :

- structure HTML sémantique adaptée ;
- nom accessible des contrôles interactifs ;
- ordre de tabulation logique ;
- focus visible et non masqué ;
- interaction clavier équivalente à la souris ;
- contrastes texte, icônes informatives et états ;
- erreurs liées aux champs concernés ;
- absence de dépendance à la couleur seule ;
- titres, listes et landmarks cohérents si le pattern structure une zone ;
- contenus dynamiques annoncés si nécessaire.

Points design minimum :

- hiérarchie claire et intentionnelle ;
- densité maîtrisée ;
- responsive prévu au moins pour compact, standard et large ;
- états vides/erreur/loading conçus ;
- cohérence avec la direction stabilisée de `MEMORY.md` ;
- pas d'effet visuel sans rôle produit.

### 8. Intégrer sans casser

- Ajouter la page ou le composant de démonstration nécessaire.
- Mettre à jour la documentation concernée.
- Lancer les validations disponibles adaptées à l'impact : liste, build, tests, lint SCSS en mode SCSS, accessibilité.
- Annoncer les impacts : composants touchés, pages touchées, tokens touchés, risques restants.

### 9. Statut de l'esquisse source

Après promotion :

- conserver l'esquisse comme provenance si elle reste utile ;
- ou la marquer comme remplacée par le composant canonique ;
- ne pas la référencer comme source stable ;
- éviter qu'elle devienne une variante parallèle non maintenue.

## Checklist exploitable

Avant promotion :

- [ ] Direction sélectionnée explicitement.
- [ ] Besoin réutilisable identifié.
- [ ] Critique design réalisée.
- [ ] Niveau canonique choisi.
- [ ] Composants existants vérifiés.
- [ ] Impacts probables listés.

Pendant promotion :

- [ ] JSON/Twig/MD et styles créés ou mis à jour.
- [ ] Styles chargés par le point d'entrée (import SCSS, ou classes détectées par Tailwind).
- [ ] Props, variantes et états définis.
- [ ] Tokens existants réutilisés ou nouveaux tokens justifiés.
- [ ] Responsive traité.
- [ ] États vide, erreur, loading et disabled traités si pertinents.

Avant validation :

- [ ] Contrastes vérifiés.
- [ ] Focus visible.
- [ ] Clavier utilisable.
- [ ] Noms accessibles présents.
- [ ] Structure sémantique correcte.
- [ ] Documentation à jour.
- [ ] Analyse d'impact rédigée.
- [ ] Esquisse source non présentée comme canonique.

## Sortie attendue d'une promotion

Une promotion terminée doit fournir :

- le composant, pattern ou page canonique ;
- la documentation d'usage ;
- les variantes et états disponibles ;
- les tokens ajoutés ou modifiés, avec justification ;
- les contrôles RGAA/design effectués ;
- les impacts connus ;
- la décision sur le statut de l'esquisse source.
