// js/modules/recipes.js
// Sprint 2 — Logique métier du module Recettes

const VALID_TYPES = ['vegetal', 'viande', 'poisson'];

// Ordre de priorité des types pour le pool favori
const TYPE_ORDER = { vegetal: 0, poisson: 1, viande: 2 };

let _idCounter = 0;

export function filterByType(recipes, type) {
  if (type === 'all') return recipes;
  return recipes.filter(r => r.type === type);
}

export function filterByFavorites(recipes) {
  return recipes.filter(r => r.stars >= 5);
}

export function filterByOrigin(recipes, origin) {
  return recipes.filter(r => r.origin === origin);
}

export function rateRecipe(recipes, id, stars) {
  if (stars < 0 || stars > 5) {
    throw new Error(`Note invalide : ${stars}. Doit être entre 0 et 5.`);
  }
  const recipe = recipes.find(r => r.id === id);
  if (recipe) recipe.stars = stars;
  return recipes;
}

export function getFavoritePool(recipes) {
  return recipes
    .filter(r => r.stars === 5)
    .sort((a, b) => (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99));
}

export function createRecipe(data) {
  return {
    id: `user-${Date.now()}-${++_idCounter}`,
    stars: 0,
    origin: 'user',
    season: ['toute'],
    time: '30 min',
    ...data,
  };
}

export function validateRecipe(recipe) {
  if (!recipe.name || !recipe.name.trim()) return false;
  if (!VALID_TYPES.includes(recipe.type)) return false;
  return true;
}
