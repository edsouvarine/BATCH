// js/modules/planning.js
// Sprint 3 — Génération et gestion du planning hebdomadaire

const DAYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
const MAX_VIANDE = 3;
const MIN_VEGETAL = 4;

/**
 * Génère un menu de 7 repas en respectant les règles métier :
 * - max 3 viandes · min 4 végétal
 * - priorité aux recettes 5 étoiles
 * - pas de doublon
 */
export function generateWeekMenu(recipes) {
  const fav5Vegetal  = recipes.filter(r => r.stars === 5 && r.type === 'vegetal');
  const fav5Viande   = recipes.filter(r => r.stars === 5 && r.type === 'viande');
  const fav5Poisson  = recipes.filter(r => r.stars === 5 && r.type === 'poisson');
  const otherVegetal = recipes.filter(r => r.stars < 5  && r.type === 'vegetal');
  const otherViande  = recipes.filter(r => r.stars < 5  && r.type === 'viande');
  const otherPoisson = recipes.filter(r => r.stars < 5  && r.type === 'poisson');

  const selected = [];
  let viandeCount = 0;

  const add = (recipe) => {
    if (selected.length >= 7 || !recipe) return false;
    if (selected.find(r => r.id === recipe.id)) return false;
    selected.push(recipe);
    if (recipe.type === 'viande') viandeCount++;
    return true;
  };

  // 1. Favoris 5★ — végétal en priorité
  for (const r of fav5Vegetal) add(r);

  // 2. Favoris 5★ — viande (dans la limite des 3)
  for (const r of fav5Viande) {
    if (viandeCount < MAX_VIANDE) add(r);
  }

  // 3. Favoris 5★ — poisson
  for (const r of fav5Poisson) add(r);

  // 4. Compléter avec végétaux non favoris
  for (const r of otherVegetal) add(r);

  // 5. Compléter avec viandes non favorites (respect MAX_VIANDE)
  for (const r of otherViande) {
    if (viandeCount < MAX_VIANDE) add(r);
  }

  // 6. Compléter avec poissons non favoris
  for (const r of otherPoisson) add(r);

  const menu = {};
  DAYS.forEach((day, i) => {
    if (selected[i]) menu[day] = selected[i].id;
  });
  return menu;
}

export function countByType(menu, recipes) {
  const counts = { vegetal: 0, viande: 0, poisson: 0 };
  for (const id of Object.values(menu)) {
    const r = recipes.find(r => r.id === id);
    if (r && counts[r.type] !== undefined) counts[r.type]++;
  }
  return counts;
}

export function validateMenu(menu, recipes) {
  if (Object.keys(menu).length !== 7) return false;
  const counts = countByType(menu, recipes);
  if (counts.viande > MAX_VIANDE) return false;
  if (counts.vegetal < MIN_VEGETAL) return false;
  return true;
}

export function assignRecipeToDay(plan, date, recipeId) {
  return { ...plan, [date]: recipeId };
}

export function removeRecipeFromDay(plan, date) {
  const updated = { ...plan };
  delete updated[date];
  return updated;
}

/**
 * Retourne le lundi de la semaine courante + offsetWeeks semaines.
 */
export function getWeekStart(offsetWeeks = 0) {
  const now = new Date();
  const day = now.getDay(); // 0=dim, 1=lun ... 6=sam
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMonday + offsetWeeks * 7);
  return monday;
}

export function formatWeekKey(date) {
  return date.toISOString().split('T')[0];
}
