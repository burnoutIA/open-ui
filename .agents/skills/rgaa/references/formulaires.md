# Formulaires

Utiliser cette reference pour inputs, selects, checkboxes, radios, switches, groupes de champs, recherche, filtres et validation.

## Regles

- Chaque champ a un nom accessible explicite.
- Preferer un `<label for="id">` associe a un controle avec `id`.
- Les groupes de radios/checkboxes lies ont un `fieldset` et une `legend`.
- Les champs obligatoires sont indiques sans se reposer seulement sur la couleur ou l'asterisque.
- Les aides et erreurs sont reliees par `aria-describedby`.
- Les champs invalides exposent `aria-invalid="true"`.
- Les erreurs critiques ou globales sont annoncables et visibles.
- Le type HTML est adapte : `email`, `tel`, `number`, `date`, etc., sans bloquer les formats valides attendus.

## Points De Controle

- Le label reste visible ou le nom accessible reste robuste.
- Le placeholder ne remplace pas le label.
- Les messages d'erreur disent quoi corriger.
- Le focus peut aller vers le premier champ en erreur apres soumission si le parcours le demande.
- Les controles custom ne perdent pas role, etat, valeur et clavier.
- Les ids generes restent uniques dans une page.

## Documentation Composant

Pour un composant de formulaire, documenter :

- props de label, aide, erreur, required, disabled ;
- relation `id` / `for` ;
- comportement erreur ;
- contraintes sur `options` pour radios/selects ;
- clavier attendu si le controle est custom.
