// js/services/storage.js
// Sprint 1 — Persistance LocalStorage

const KEYS = {
  plan:          'batch_plan',
  ratings:       'batch_ratings',
  customRecipes: 'batch_custom_recipes',
  checkedItems:  'batch_checked_items',
};

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw !== null ? JSON.parse(raw) : fallback;
}

export const Storage = {
  savePlan(plan)             { save(KEYS.plan, plan); },
  loadPlan()                 { return load(KEYS.plan, {}); },

  saveRatings(ratings)       { save(KEYS.ratings, ratings); },
  loadRatings()              { return load(KEYS.ratings, {}); },

  saveCustomRecipes(arr)     { save(KEYS.customRecipes, arr); },
  loadCustomRecipes()        { return load(KEYS.customRecipes, []); },

  saveCheckedItems(obj)      { save(KEYS.checkedItems, obj); },
  loadCheckedItems()         { return load(KEYS.checkedItems, {}); },

  clearAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
};
