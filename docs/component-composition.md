# Composition JSON (avancé)

> A lire seulement si un composant doit **declarer** sa composition au-dela des `include` Twig.
>
> Etat reel des outils :
> - `parts`, `collections`, `families`, `instances` et `layoutGroups` declarent des relations : le graphe (`.openui/graph.json`, `npm run impact`) les ajoute a celles deduites des `include` Twig, et le Showcase les affiche comme « contrat de composition ».
> - `binding`, `autoBind`, `exclude` et les `defaults` de ces noeuds ne sont exploites par **aucun outil** : le Twig parent cable lui-meme les props de l'enfant. Les utiliser seulement comme documentation, ou les faire exploiter avant d'en dependre.
>
> Dans la plupart des cas, un `include` Twig suffit : la relation est detectee sans rien declarer.

## `parts`

`parts` reference un sous-composant unique editable sans dupliquer son JSON canonique.

```json
{
  "parts": {
    "cta": {
      "label": "CTA",
      "component": "button",
      "mode": "single",
      "autoBind": true
    }
  }
}
```

Champs supportes :
- `label` : libelle affiche dans l’inspecteur agentique
- `component` : id du composant canonique reference
- `mode` : `single` uniquement pour l'instant
- `binding` : mapping explicite enfant -> parent
- `autoBind` : mapping automatique par convention de nommage
- `exclude` : retire certains champs de l'autobind
- `defaults` : valeurs locales figees ou initialisees

## `collections`

`collections` modelise une structure repetitive. Le comportement bulk ne doit pas etre deduit automatiquement: il doit etre annonce explicitement comme une vraie liste.

```json
{
  "collections": {
    "articles": {
      "label": "Cards listing",
      "kind": "list",
      "itemComponent": "card",
      "mode": "bulk",
      "autoBind": true,
      "exclude": {
        "variants": ["horizontal"],
        "content": ["title", "text"]
      }
    }
  }
}
```

Champs supportes :
- `label` : libelle affiche dans l’inspecteur agentique
- `kind` : type semantique de repetition. Utiliser `list` pour une vraie liste editable en bulk
- `itemComponent` : composant canonique de chaque item
- `mode` : `bulk` uniquement pour l'instant
- `binding` / `autoBind` / `exclude` : meme logique que pour `parts`

## Regle de bulk explicite

- une repetition de composants n'est pas automatiquement une liste
- pour ouvrir un vrai tiroir bulk de famille, le JSON doit declarer explicitement `kind: "list"`
- sans `kind: "list"`, une repetition doit etre modelisee autrement : instances individuelles, groupes de layout, ou autre structure plus fine
- cas typique de `list` : liste de `card`, listing d'articles, grille de produits, menu repetitif
- cas non-`list` typique : page de formulaire avec plusieurs `input`, `checkbox`, `switch`, ou `button`

## Regle de source de verite

- Le composant enfant reste defini dans son propre JSON canonique.
- Le parent ne copie jamais le schema complet de l'enfant.
- Le parent expose seulement les champs plats necessaires pour piloter l'enfant.

## Convention `autoBind`

Quand `autoBind: true`, le moteur cherche automatiquement les champs parent via une convention plate :

- prefixe = identifiant du `part` ou de la `collection`
- suffixe = nom du champ enfant avec premiere lettre capitalisee

Exemples :
- `parts.cta` + `button.variant` -> `ctaVariant`
- `parts.cta` + `button.text` -> `ctaText`
- `parts.header` + `header-nav.ctaSize` -> `headerCtaSize`
- `parts.footer` + `footer.copyright` -> `footerCopyright`
- `collections.articles` + `card.hasImage` -> `articlesHasImage` si ce champ existe

## Quand utiliser `binding`

Utiliser un `binding` explicite si :
- le parent ne suit pas la convention `autoBind`
- le parent doit re-utiliser un champ deja existant
- le parent doit adapter une semantique specifique

Exemple :

```json
{
  "parts": {
    "cta": {
      "label": "CTA",
      "component": "button",
      "mode": "single",
      "binding": {
        "variants": {
          "variant": "primaryActionVariant"
        },
        "content": {
          "text": "primaryActionLabel"
        }
      }
    }
  }
}
```

## Quand utiliser `exclude`

Utiliser `exclude` pour ne pas exposer automatiquement certains champs enfant.

Cas typiques :
- une collection de `card` ne doit pas bulk-editer `title` ou `text`
- un parent veut figer `horizontal`
- un champ existe techniquement mais n'a pas d'interet produit dans l’inspecteur agentique

## Regles d'usage JSON v2

- `parts` pour un sous-composant unique : CTA, header, footer, media block
- `collections` uniquement pour une repetition explicitement declaree, idealement avec `kind: "list"`
- une repetition visuelle seule ne suffit pas pour declarer une `collection`
- les vraies listes (`kind: "list"`) sont editees en bulk par defaut
- ne pas introduire de recursivite arbitrairement profonde sans besoin valide

## JSON v2+ : repetition non-`list`

Quand une page repete plusieurs composants sans etre une vraie liste editoriale, ne pas utiliser `collections`.
Utiliser a la place trois noeuds complementaires :

- `families` : reglage partage par type de composant repete
- `instances` : occurrence individuelle editable
- `layoutGroups` : structure de placement et de grille

Cas typique :
- page formulaire avec plusieurs `input`, `select`, `switch`, `checkbox`, `button`
- chaque champ garde son propre texte, son aide, son required, etc.
- plusieurs champs partagent quand meme un style commun
- les lignes et colonnes doivent rester pilotables explicitement

Exemple :

```json
{
  "families": {
    "inputs": {
      "label": "Inputs",
      "component": "input",
      "mode": "shared",
      "autoBind": true,
      "exclude": {
        "content": ["label", "placeholder", "helpText", "errorMessage"]
      }
    }
  },
  "instances": {
    "firstName": {
      "label": "Prenom",
      "component": "input",
      "family": "inputs",
      "mode": "single",
      "defaults": {
        "variants": {
          "type": "text",
          "required": true
        },
        "content": {
          "label": "Prenom",
          "placeholder": "ex : Jean"
        }
      }
    }
  },
  "layoutGroups": {
    "personalRow1": {
      "label": "Informations personnelles - ligne 1",
      "component": "grid",
      "mode": "layout",
      "children": ["firstName", "lastName"],
      "defaults": {
        "variants": {
          "cols": "1",
          "gap": "lg"
        }
      }
    }
  }
}
```

## Semantique `families`

`families` sert a piloter les reglages communs d'un type de composant repete.

Champs recommandes :
- `label`
- `component` : composant canonique partage par la famille
- `mode` : `shared`
- `binding` / `autoBind` / `exclude`
- `defaults`

Usage recommande :
- variantes visuelles partagees
- options fonctionnelles communes si elles ont un vrai sens produit

Usage deconseille :
- texte, placeholder, aide, options editoriales propres a chaque instance

## Semantique `instances`

`instances` represente une occurrence concrete editable individuellement.

Champs recommandes :
- `label`
- `component`
- `family` : optionnel, rattache l'instance a une famille partagee
- `mode` : `single`
- `binding` / `autoBind`
- `defaults`

Usage recommande :
- labels
- placeholders
- help text
- required
- options d'un select
- texte specifique d'un bouton

## Semantique `layoutGroups`

`layoutGroups` represente le placement et la structure de composition.

Champs recommandes :
- `label`
- `component` : typiquement `grid`
- `mode` : `layout`
- `children` : ids d'`instances` ou de `parts`
- `binding` / `autoBind`
- `defaults`

Usage recommande :
- lignes de formulaire
- groupes 2 colonnes / 3 colonnes
- zones de placement explicites

## Regles d'usage pour repetition non-`list`

- une repetition non-editoriale ne devient pas une `collection`
- utiliser `families` pour le style partage
- utiliser `instances` pour le contenu propre a chaque occurrence
- utiliser `layoutGroups` pour les lignes, grilles et regroupements
- une meme page peut combiner `parts`, `collections`, `families`, `instances`, et `layoutGroups`
- `collections` reste reserve aux vraies listes avec `kind: "list"`
