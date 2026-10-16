# Format D'analyse Figma

Utiliser un JSON compact comme contrat entre l'analyse approuvee et l'implementation. Stocker le fichier dans `.openui/analyses/<slug>.json`.

## Schema Minimal

```json
{
  "schemaVersion": 1,
  "id": "contact-page",
  "status": "awaiting_confirmation",
  "source": {
    "type": "figma",
    "url": "https://www.figma.com/design/...",
    "fileKey": "...",
    "nodeId": "123:456",
    "name": "Contact / Desktop"
  },
  "target": {
    "type": "page",
    "suggestedId": "contact"
  },
  "observations": {
    "frames": [],
    "interactions": [],
    "assets": [],
    "unknowns": []
  },
  "inventory": [
    {
      "figmaNodeId": "123:500",
      "label": "Primary action",
      "decision": "reuse",
      "openUiTarget": "button",
      "confidence": "high",
      "rationale": "Le contrat existant couvre le style et le comportement."
    }
  ],
  "questions": [
    {
      "id": "mobile-navigation",
      "topic": "responsive",
      "question": "Le menu mobile doit-il s'ouvrir en panneau ou se replier dans la page ?",
      "recommendation": "Utiliser un panneau pilote par un bouton natif.",
      "blocking": true,
      "answer": null
    }
  ],
  "approval": {
    "approvedAt": null,
    "scope": null
  },
  "implementation": {
    "files": [],
    "checks": {},
    "evidence": []
  }
}
```

## Regles De Donnees

- Garder les identifiants Figma necessaires pour retrouver la cible ; ne pas stocker tout le document Figma.
- Ne pas copier dans l'artefact la liste complete du design system.
- Stocker la decision de mapping et sa justification, pas les donnees derivees regenerables.
- Utiliser `high`, `medium` ou `low` pour `confidence`.
- Utiliser une decision parmi `reuse`, `reuse-with-props`, `new-variant`, `new-component`, `page-composition`, `unknown`.
- Enregistrer les reponses utilisateur dans `questions[].answer` et conserver la recommandation initiale.
- Mettre `approval.scope` a une phrase courte qui indique exactement ce qui a ete accepte.
- Garder les chemins de fichiers relatifs au depot.
- Enregistrer dans `implementation.checks` les statuts `pass`, `fail`, `manual`, `question`, `not-applicable`.

## Sortie De La Commande D'analyse

Restituer dans cet ordre :

1. source et rendu de reference ;
2. composants reutilises ;
3. variantes proposees ;
4. nouveaux composants proposes ;
5. composition de page ;
6. risques et impacts ;
7. questions avec recommandation ;
8. chemin de l'artefact ;
9. verdict `awaiting_confirmation`.

Ne pas noyer la decision dans le detail de tous les layers Figma. Regrouper par unite d'interface utile.

## Mise A Jour Apres Confirmation

- Reporter chaque reponse.
- Corriger le mapping si necessaire.
- Renseigner `approval.approvedAt` et `approval.scope`.
- Passer a `approved` seulement si toutes les questions bloquantes ont une reponse.
- Ne jamais transformer automatiquement une recommandation non commentee en approbation.
