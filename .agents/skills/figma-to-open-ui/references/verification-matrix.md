# Matrice De Verification

Appliquer cette matrice pendant la commande `open-ui-implement-figma`. Adapter le perimetre au composant ou a la page, sans supprimer silencieusement une famille de controles applicable.

## Design System

| Controle | Preuve attendue |
|---|---|
| Reutilisation avant creation | Mapping final vers les composants et variantes |
| Niveau de changement | Justification composant, variante, page ou token |
| Relations | Graphe ou analyse d'impact relu |
| Contrats | JSON, Twig, Markdown et SCSS valides |
| Tokens | Aucun nouveau token sans besoin transversal confirme |

## Fidelite Figma

| Controle | Preuve attendue |
|---|---|
| Structure | Capture du rendu et frame de reference |
| Hierarchie | Titres, actions et ordre de lecture coherents |
| Composition | Alignements, espacements et proportions significatives relus |
| Contenu | Textes, icones, images et etats presents |
| Ecart volontaire | Decision expliquee et approuvee |

Ne pas imposer un pixel-perfect aveugle. Corriger les ecarts de mise en oeuvre ; signaler les divergences causees par une regle du design system ou une ambiguite Figma.

## Responsive

| Controle | Preuve attendue |
|---|---|
| Frames Figma | Chaque largeur fournie est testee |
| Viewports projet | Mobile, tablette et desktop couverts |
| Reflow | Aucun contenu essentiel masque ou debordement global injustifie |
| Ordre | Ordre DOM, lecture et focus coherents apres reorganisation |
| Robustesse | Contenu long et contenu absent testes si plausibles |

## Interaction Et Navigateur

| Controle | Preuve attendue |
|---|---|
| Actions visibles | Clic et comportement attendu testes |
| Clavier | Tab, activation, Escape et fleches selon le pattern |
| Focus | Visibilite, deplacement et retour de focus relus |
| Runtime | Pas d'erreur console liee au changement |
| Etats | Hover, focus, actif, disabled, loading, erreur ou succes selon le contrat |

## Automatique

| Controle | Preuve attendue |
|---|---|
| JSON | `npm run validate` |
| Tests | `npm test` selon le changement |
| SCSS | `npm run lint:scss` si styles touches |
| Build | `npm run build` si rendu ou imports touches |
| Impact | `npm run impact -- <composant>` pour les composants partages |
| HTML | Validation W3C/Nu disponible |
| Accessibilite | Axe sur les etats representatifs |

## RGAA Et Questions Humaines

Verifier les themes applicables avec le skill `rgaa`. Classer chaque reste en `manual`, `question` ou `not-applicable`.

Poser une question seulement si le contexte humain ou metier manque, par exemple :

- pertinence d'une alternative textuelle ;
- comportement de focus apres une transition ;
- ordre de lecture lorsque Figma ne donne qu'un ordre visuel ;
- formulation d'un message d'erreur ou de statut ;
- equivalence accessible d'une information visuelle ou gestuelle.

Ne pas conclure a la conformite RGAA sur la seule base d'Axe, du HTML valide ou d'une revue agentique.

## Verdict

- `done` : controles obligatoires reussis, ecarts acceptes traces, aucune question bloquante.
- `review` : implementation exploitable mais verification ou arbitrage non bloquant restant.
- `blocked` : decision, acces, erreur ou question empechant de terminer proprement.
