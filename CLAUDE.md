# CLAUDE.md — BATCH Cooking App

> **Lit ce fichier en premier.** Il est la source de vérité pour cette session CLI.
> Consulte ensuite `PROJECT.md` pour les specs complètes.

---

## Qui tu es dans ce projet

Tu es **Kimi K2.5**, l'**Exécuteur** du tandem IA.
L'**Architecte** (Claude Sonnet 4.6 dans Antigravity) a défini les specs, la structure, et les tests.
**Ton rôle** : implémenter le code pour faire passer les tests, sprint par sprint.

---

## Le projet

**BATCH** — Application web SPA de batch cooking familial.
- **Famille** : Nico (adulte ×1.0), Flo (adulte ×1.0), Sacha (enfant 12 ans ×0.8), Victor (enfant 9 ans ×0.8)
- **Stack** : HTML / CSS / JS (modules ES6) + Claude API + Playwright
- **Méthode** : TDD strict — Red → Green → Refactor

---

## Workflow TDD à suivre

```
1. Lire le test du sprint courant (tests/unit/)
2. Vérifier qu'il échoue (Red) → npm test
3. Implémenter le minimum pour le faire passer (Green)
4. Refactoriser si besoin sans casser les tests
5. Valider → npm test → tous verts ✅
6. Passer au sprint suivant
```

---

## État actuel — Sprint 1 : Fondations

### Tests écrits (à faire passer) :
- `tests/unit/portions.test.js` → implémenter `js/utils/portions.js`
- `tests/unit/storage.test.js` → implémenter `js/services/storage.js`
- `tests/unit/shopping-split.test.js` → implémenter `js/data/shopping.js`

### Tests des sprints suivants (NE PAS IMPLÉMENTER ENCORE) :
- `tests/unit/recipes.test.js` → Sprint 2
- `tests/unit/planning.test.js` → Sprint 3

### Démarrage rapide :
```bash
npm install
npm test  # → doit échouer (Red phase)
```

---

## À implémenter maintenant (Sprint 1)

### 1. `js/utils/portions.js`
```js
export const FAMILY_MEMBERS = [
  { name: 'Nico', type: 'adulte', multiplier: 1.0 },
  { name: 'Flo', type: 'adulte', multiplier: 1.0 },
  { name: 'Sacha', type: 'enfant', age: 12, multiplier: 0.8 },
  { name: 'Victor', type: 'enfant', age: 9, multiplier: 0.8 },
];
// getTotalMultiplier() → 3.6
// calculatePortions(grammage, multiplier?, memberName?) → entier arrondi
```

### 2. `js/services/storage.js`
```js
export const Storage = {
  savePlan(plan), loadPlan(),           // plan = { 'YYYY-MM-DD': 'r01', ... }
  saveRatings(ratings), loadRatings(),  // ratings = { r01: 5, r02: 4, ... }
  saveCustomRecipes(arr), loadCustomRecipes(),
  saveCheckedItems(obj), loadCheckedItems(),
  clearAll(),
}
// Utilise JSON.stringify/parse avec localStorage
```

### 3. `js/data/shopping.js`
```js
// Règles de répartition Koro / Super U
// Koro  : légumineuses sèches, céréales, farines, épices, huiles, graines
// SuperU: légumes frais, viandes, poissons, crémerie, œufs, conserves, boulangerie
export function assignStore(ingredientName) → 'koro' | 'superu'
export function splitShoppingList(items) → { koro: [...], superu: [...] }
```

---

## Structure du projet (ne pas modifier)

```
js/
  data/       recipes.js, shopping.js
  modules/    planning.js, recipes.js, shopping.js, ordering.js, batch.js
  services/   claude.js, storage.js, playwright.js
  utils/      portions.js, seasons.js
tests/unit/   *.test.js (NE PAS MODIFIER les tests)
tests/e2e/    (Sprint 5)
playwright/   koro.js, superu.js (Sprint 5)
```

---

## Règles strictes

- ❌ Ne jamais modifier les fichiers `tests/`
- ❌ Ne pas importer de librairies externes non listées dans `package.json`
- ✅ ES Modules (`export`, `import`) — pas de CommonJS (`require`)
- ✅ Committer uniquement quand `npm test` est vert
- ✅ Signaler si un test semble incorrect ou ambigu
