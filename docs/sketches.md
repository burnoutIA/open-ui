# Sketches

## Intention

Open UI doit savoir creer des esquisses quand l'utilisateur explore une idee, sans polluer le design system canonique.

Une esquisse sert a chercher une direction. Un composant canonique sert a etre reutilise durablement.

Le mode normal d'Open UI reste le design system : reutilisation, variantes, impacts, tokens et validation. Le mode esquisse est un tunnel a part, declenche explicitement, pour autoriser une recherche plus libre en debut de projet.

## Declenchement

Le tunnel esquisse doit etre declenche par la commande `/open-ui-sketch` ou par une demande explicite equivalente : maquette libre, exploration visuelle, brouillon, sketch, tester une direction sans l'integrer au DS.

Une demande vague ne suffit pas a basculer en esquisse : dans ce cas, il faut cadrer la demande ou rester dans le workflow design system.

## Contrat

- Une esquisse doit etre marquee comme experimentale.
- Une esquisse ne doit pas etre referencee par defaut comme composant stable.
- Une esquisse peut etre moins normalisee, mais doit rester lisible et visualisable.
- Une esquisse ne doit pas modifier des composants canoniques, tokens globaux ou conventions partagees sans confirmation explicite.
- Une esquisse HTML/CSS/JS autonome a sa source dans `dev/sketches/<slug>/`.
- `public/sketches/<slug>/` est le rendu généré par Vite : il peut être ignoré pendant le développement ou conservé pour la production, mais ne constitue jamais la source de vérité.
- Si une esquisse devient utile, elle doit etre promue en composant canonique avec JSON, Twig, Markdown et SCSS propres.
- La promotion doit inclure une analyse d'impact, les variantes/tokens necessaires et une verification RGAA selon la cible.
- La promotion passe par `/open-ui-consolidate-sketch` et le skill `sketch-to-production`.

## Difference avec un composant canonique

| Type | But | Contraintes |
|------|-----|-------------|
| Esquisse | explorer une idee | rapide, explicite, non canonique, tunnel a part |
| Composant | reutiliser durablement | JSON/Twig/MD/SCSS, accessibilite, tokens, impact |

## Sortie attendue d'une esquisse

- Le rendu ou la page visualisable.
- Des fichiers source dans `dev/sketches/<slug>/`, puis un rendu ouvrable dans `public/sketches/<slug>/` après build.
- Le statut experimental clairement visible dans le nom, le chemin ou la documentation.
- Les limites assumées du brouillon.
- Une section "A consolider si on garde cette direction" : composants a extraire, variantes/tokens a creer, impacts a analyser, RGAA a reprendre.

## Questions a resoudre

- Frontière retenue : `dev/sketches/<slug>/` contient les sources ; `public/sketches/<slug>/` contient le rendu généré.
- Quel statut utiliser dans le JSON : `draft`, `sketch`, `canonical` ?
- Comment promouvoir une esquisse en composant sans casser les pages ? Reponse de workflow : passer par `/open-ui-consolidate-sketch`, cartographier les usages proches, choisir composant/variante/page/token/pattern, puis appliquer impact + RGAA + validations.
- Faut-il inclure les esquisses dans `npm run list` ?
- Comment eviter que les esquisses deviennent un cimetiere de composants morts ?

## Promotion vers production

Une esquisse retenue ne devient pas production par deplacement de fichier. Elle doit etre traduite en contrat durable.

Workflow recommande :

1. Identifier la source retenue : fichier, capture, direction ou retour utilisateur.
2. Relire la section "A consolider si on garde cette direction".
3. Extraire ce qui doit survivre : intention utilisateur, hierarchie, composition, interaction, langage visuel.
4. Jeter ce qui etait experimental : donnees factices, styles locaux, libelles temporaires, raccourcis CSS.
5. Cartographier les composants, variantes, tokens et pages proches.
6. Choisir le niveau de production : composant canonique, variante, composition, page locale, token ou pattern documente.
7. Implementer proprement dans le design system, avec docs et exemples credibles.
8. Verifier impact, RGAA, validations et rendu navigateur.
