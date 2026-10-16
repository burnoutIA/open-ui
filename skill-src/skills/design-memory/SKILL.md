---
name: design-memory
description: Skill local de memoire design projet pour Open UI. A utiliser pour maintenir MEMORY.md comme source projet unique, classer les retours utilisateur sur le design, stabiliser les decisions dans sa section Direction stabilisee, proposer la promotion de regles de comportement vers le skill local pertinent, et garder les apprentissages de sketch/design propres et non redondants.
---

# Design Memory

Ce skill garde la memoire design d'un projet lisible dans un seul fichier. Il separe les decisions stabilisees, les preferences utilisateur, les apprentissages contextuels et les brouillons exploratoires sans multiplier les sources.

## Sources

- `MEMORY.md` : source projet unique, avec une section "Direction stabilisée" et des entrees de provenance.
- Skills design locaux : regles transversales du repo.
- Skill projet : regles specifiques au workflow Open UI.

Ne pas creer de `DESIGN.md` sans demande explicite.

## Structure de MEMORY.md

Ne pas traiter `MEMORY.md` comme un simple journal. Il contient deux niveaux :

- "Direction stabilisée" : source de verite design du projet.
- "Entrées" : provenance, retours concrets, exemples et vigilances.
- Une preference utilisateur repetee ou une direction retenue doit finir dans "Direction stabilisée".
- Un exemple critique, une cause d'erreur ou une vigilance non encore generalisee peut rester dans "Entrées".
- Une regle qui explique comment l'agent doit se comporter doit finir dans le skill local le plus specifique.

Si une information existe deux fois dans `MEMORY.md`, garder la version normative dans "Direction stabilisée", puis compacter l'entree en note de provenance ou supprimer le doublon.

## Priorite des sources

Quand deux fichiers semblent se contredire :

1. Le skill local le plus specifique gagne pour le comportement de l'agent.
2. La section "Direction stabilisée" de `MEMORY.md` gagne pour la direction design du projet.
3. Les entrees de provenance de `MEMORY.md` expliquent l'historique, mais ne gagnent pas sur la direction stabilisee.
4. Les references d'un skill completent le `SKILL.md`, mais ne doivent pas contredire sa posture.

## Classification des retours

Classer chaque retour utilisateur :

- `preference` : gout durable de l'utilisateur ;
- `project_rule` : regle propre au produit/projet ; si elle est stabilisee, elle doit etre dans la section "Direction stabilisée" ;
- `agent_rule_candidate` : regle potentiellement reusable dans un skill local ;
- `rejected_direction` : piste testee et refusee ;
- `accepted_direction` : piste retenue ;
- `open_question` : decision encore floue.

## Mise a jour de la direction stabilisee

Ajouter dans la section "Direction stabilisée" seulement les informations utiles au prochain design :

- intention produit ;
- audience et moment d'usage ;
- principes d'experience ;
- langage visuel ;
- patterns d'interaction ;
- choses a faire ;
- choses a eviter ;
- decisions datees ;
- questions ouvertes.

Eviter le journal brut dans cette section. Fusionner les doublons et reformuler en regles courtes.

## Mise a jour des entrees

Utiliser les entrees de provenance pour les apprentissages encore contextuels :

- retour critique concret ;
- exemple fondateur ;
- vigilance temporaire ;
- decision non encore integree dans la direction stabilisee ou un skill.

Ne pas dupliquer une regle deja presente dans la direction stabilisee ou un skill. Preferer "deja integre" a l'empilement.

## Promotion vers skills

Ne modifier un `SKILL.md` local que si :

- l'utilisateur le demande explicitement ; ou
- la meme regle reapparait dans plusieurs contextes du projet ; ou
- une erreur recurrente montre un manque de garde-fou local.

Quand une promotion est justifiee :

1. extraire la regle courte ;
2. retirer ou compacter les doublons dans les entrees de provenance ;
3. ajouter la regle au skill le plus specifique ;
4. verifier que le skill reste concis ;
5. noter la decision dans la direction stabilisee ou les entrees selon le cas.

## Workflow apres critique utilisateur

1. Corriger le livrable si une correction est attendue.
2. Identifier le type de retour.
3. Mettre a jour la direction stabilisee si la regle impacte le futur design du projet.
4. Ajouter ou compacter une entree si le retour est un exemple ou une vigilance.
5. Noter comme `agent_rule_candidate` si le retour semble reusable ; promouvoir vers skill seulement si les criteres de promotion sont remplis.

## References

- Format de notes : `references/memory-format.md`.
