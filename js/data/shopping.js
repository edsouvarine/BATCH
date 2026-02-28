// js/data/shopping.js
// Sprint 1 — Répartition Koro / Super U

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Mots-clés (stems) identifiant les produits Koro
const KORO_STEMS = [
  // légumineuses sèches
  'lentill', 'pois chich', 'haricot sec', 'haricot rouge', 'haricot blanc',
  'haricot noir', 'feve', 'soja', 'tofu',
  // céréales
  'riz', 'quinoa', 'boulgour', 'avoine', 'flocon', 'orge', 'millet', 'epautre',
  // pâtes & semoules
  'pate', 'spaghetti', 'tagliatell', 'couscous', 'semoule', 'nouill',
  // farines
  'farine', 'fecule', 'amidon',
  // épices & condiments secs
  'cumin', 'curry', 'paprika', 'curcuma', 'cannelle', 'coriandre',
  'gingembre', 'muscade', 'origan', 'thym', 'basilic', 'epice',
  'ras el hanout', 'piment', 'poivre noir',
  // huiles
  'huile',
  // graines & fruits secs
  'graine', 'sesame', 'chia', 'tournesol', 'cajou', 'amande', 'noisette', 'noix',
  // autres produits secs Koro
  'cacao', 'levure', 'bicarbonate',
];

export const STORE_RULES = {
  koro:   KORO_STEMS,
  superu: ['default'],
};

export function assignStore(ingredientName) {
  const n = normalize(ingredientName);
  const isKoro = KORO_STEMS.some(stem => n.includes(stem));
  return isKoro ? 'koro' : 'superu';
}

export function splitShoppingList(items) {
  const result = { koro: [], superu: [] };
  for (const item of items) {
    result[assignStore(item.name)].push(item);
  }
  return result;
}
