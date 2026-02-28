// js/modules/shopping.js
// Sprint 4 — Génération et agrégation de la liste de courses

import { getTotalMultiplier } from '../utils/portions.js';

/**
 * Applique le coefficient famille à une quantité adulte de référence.
 * Retourne un entier arrondi.
 */
export function computeQuantity(qty, _unit) {
  return Math.round(qty * getTotalMultiplier());
}

/**
 * Fusionne les doublons (même nom + même unité) en sommant leurs quantités.
 */
export function aggregateIngredients(items) {
  const map = new Map();
  for (const item of items) {
    const key = `${item.name}__${item.unit}`;
    if (map.has(key)) {
      map.get(key).qty += item.qty;
    } else {
      map.set(key, { ...item });
    }
  }
  return Array.from(map.values());
}

/**
 * Génère la liste de courses agrégée à partir d'un menu hebdomadaire.
 * menu   : { lun: 'r01', mar: 'r02', ... }
 * recipes: tableau de recettes avec champ `ingredients`
 */
export function generateShoppingList(menu, recipes) {
  const raw = [];
  for (const recipeId of Object.values(menu)) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe || !recipe.ingredients) continue;
    for (const ingredient of recipe.ingredients) {
      raw.push({
        ...ingredient,
        qty: computeQuantity(ingredient.qty, ingredient.unit),
      });
    }
  }
  return aggregateIngredients(raw);
}

/**
 * Regroupe une liste d'items par leur champ `category`.
 * Retourne { 'Légumineuses': [...], 'Légumes': [...], ... }
 */
export function groupByCategory(items) {
  const groups = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  return groups;
}
