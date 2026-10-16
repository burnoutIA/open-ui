# Moteur multi-harnais des skills

`skill-src/` est l'unique source editable des skills et commandes Open UI. Les dossiers `.agents/`, `.github/skills/`, `.claude/skills/`, `.opencode/skills/` et `.pi/skills/` sont des sorties de compilation : ne pas les modifier directement.

## Structure

```text
skill-src/
|- manifest.json       skills, groupes de commandes et metadonnees d'interface
|- skills/<nom>/       contenu normatif portable du skill
`- commands/<nom>.md   prompt canonique d'une commande utilisateur

scripts/skill-harness/
`- adapters/           differences de chemins et de format par harnais
```

Le moteur ne genere jamais toutes les cibles implicitement. `--target` est obligatoire.

## Commandes

```powershell
npm.cmd run skills:list-targets
npm.cmd run skills:build -- --target codex
npm.cmd run skills:check -- --target codex
```

Sous un shell Unix, utiliser les mêmes commandes avec `npm`.

La première migration depuis les anciens fichiers Codex a utilisé `npm run skills:import`. Cette commande n'est pas un workflow d'edition courant : elle refuse d'ecraser `skill-src/skills` sans `--force`.

## Cibles

| Cible | Skills | Commandes utilisateur |
|---|---|---|
| `codex` | `.agents/skills/` | sous-ensemble de skills dédiés invocables avec `$nom-de-commande` |
| `copilot` | `.github/skills/` | sous-ensemble de skills invocables dedies |
| `claude` | `.claude/skills/` | sous-ensemble de skills invocables dedies |
| `opencode` | `.opencode/skills/` | `.opencode/commands/` |
| `pi` | `.pi/skills/` | `.pi/prompts/` |

Copilot, OpenCode et Pi savent aussi découvrir des skills `.agents`, mais leurs adaptateurs dédiés permettent de produire un paquet explicite pour un environnement de travail qui l'exige.

### Catalogue de commandes et coût de contexte

Toutes les commandes restent canoniques dans `skill-src/commands/`. Pour les harnais qui doivent transformer une commande en skill, seules les commandes de `commandSkillEntrypoints` dans le manifeste deviennent des dossiers visibles dans le catalogue. Les autres opérations restent des playbooks internes à charger depuis `skill-src/commands/` lorsque le skill parent en a besoin.

Les harnais qui disposent d'un répertoire natif de commandes, comme OpenCode et Pi, reçoivent toujours la liste complète. Cette séparation évite de transformer chaque opération interne en métadonnée de skill chargée en permanence.

## Protection contre la divergence

Chaque compilation écrit `.skill-harness/<target>.lock.json` avec les empreintes des fichiers générés. Le moteur :

- refuse d'écraser une sortie modifiée à la main ;
- accepte `--force` seulement après vérification explicite ;
- supprime uniquement les anciens fichiers qu'il avait lui-même enregistrés ;
- laisse intacts les fichiers étrangers à son manifeste ;
- fournit `skills:check` pour détecter les sorties manquantes, différentes ou périmées.

Lors de la première adoption d'une cible qui contient déjà des fichiers historiques, le moteur refuse l'écrasement. Comparer les différences, puis utiliser une seule fois `--force` si ces fichiers doivent bien devenir des sorties générées.

Le test d'idempotence consiste à générer deux fois la même cible : la seconde exécution doit annoncer uniquement des fichiers inchangés et ne produire aucun diff.

## Ajouter ou modifier un skill

1. Modifier uniquement `skill-src/skills/<nom>/` et, si nécessaire, `skill-src/commands/`.
2. Mettre à jour `skill-src/manifest.json` pour enregistrer le skill, ses commandes groupées, ses entrées `commandSkillEntrypoints` ou ses métadonnées d'interface.
3. Générer uniquement la cible nécessaire.
4. Exécuter `skills:check`, le validateur du format de skill et les tests du projet.

Les adaptateurs suivent les formats officiels : [skills Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills), [skills Claude Code](https://code.claude.com/docs/en/slash-commands), [skills et commandes OpenCode](https://opencode.ai/docs/skills), [skills Pi](https://pi.dev/docs/latest/skills) et [prompt templates Pi](https://pi.dev/docs/latest/prompt-templates).
