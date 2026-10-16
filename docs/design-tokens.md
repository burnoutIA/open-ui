# Design Tokens

## Intention

Les tokens garantissent la coherence visuelle d'Open UI. Ils doivent permettre de modifier l'apparence globale sans casser les composants ni introduire des styles ponctuels incoherents.

## Contrat

- Les tokens vivent selon le mode de style : `dev/assets/scss/base/_variables.scss` en SCSS, bloc `@theme` du point d'entree en Tailwind.
- Les composants doivent utiliser les tokens existants avant d'introduire des valeurs locales.
- Les styles inline sont interdits dans les templates Twig.
- Toute nouvelle valeur repetee doit etre candidate a un token.
- Modifier un token est un changement transversal et doit etre annonce comme tel.

## Types de tokens attendus

- couleurs ;
- espacements ;
- rayons ;
- typographie ;
- ombres ;
- breakpoints ;
- z-index si necessaire.

## Regles d'usage

- Preferer `$spacing-*` aux valeurs arbitraires.
- Preferer `$color-*` aux hexadecimaux locaux.
- Preferer `$radius-*` aux rayons fixes locaux.
- Un composant peut avoir une exception locale seulement si elle est justifiee par son usage.
- Une exception repetee doit devenir un token ou une variante.

## Impact token

Avant de modifier un token, l'agent doit chercher les composants qui l'utilisent et prevenir l'utilisateur de l'impact probable.

Sortie attendue :

```text
Token touche: $spacing-lg
Composants probablement impactes: card, footer, form controls
Risque: densite verticale changee sur plusieurs pages
```

## Questions a resoudre

- Faut-il generer un index tokens -> composants ?
- Faut-il migrer les tokens SCSS vers un format source JSON partageable ?
- Comment representer les tokens par projet quand Open UI gerera plusieurs projets ?
- Comment detecter automatiquement les valeurs hardcodees qui devraient devenir des tokens ?
- Faut-il exposer les tokens comme controles editables ou les garder comme couche systeme ?
