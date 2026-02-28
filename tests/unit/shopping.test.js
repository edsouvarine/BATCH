// tests/unit/shopping.test.js
// TDD — Sprint 4 : Liste de courses agrégée
// RED phase : ces tests doivent échouer avant l'implémentation

import {
  computeQuantity,
  aggregateIngredients,
  generateShoppingList,
  groupByCategory,
} from '../../js/modules/shopping.js';

// Recettes mock avec ingrédients pour les tests
const MOCK_RECIPES = [
  {
    id: 'r01',
    name: 'Dhal de lentilles',
    type: 'vegetal',
    ingredients: [
      { name: 'Lentilles corail', qty: 200, unit: 'g',  category: 'Légumineuses' },
      { name: 'Lait de coco',     qty: 200, unit: 'ml', category: 'Conserves' },
      { name: 'Cumin moulu',      qty: 5,   unit: 'g',  category: 'Épices' },
    ],
  },
  {
    id: 'r02',
    name: 'Curry de pois chiches',
    type: 'vegetal',
    ingredients: [
      { name: 'Pois chiches', qty: 150, unit: 'g',  category: 'Légumineuses' },
      { name: 'Lait de coco', qty: 200, unit: 'ml', category: 'Conserves' },
      { name: 'Cumin moulu', qty: 5,   unit: 'g',  category: 'Épices' },
      { name: 'Courgettes',  qty: 300, unit: 'g',  category: 'Légumes' },
    ],
  },
];

describe('Module Shopping — Liste de courses', () => {

  describe('computeQuantity()', () => {
    test('multiplie la quantité adulte par le coefficient famille (3.6)', () => {
      expect(computeQuantity(100, 'g')).toBe(360);
    });
    test('retourne 0 pour une quantité nulle', () => {
      expect(computeQuantity(0, 'g')).toBe(0);
    });
    test('fonctionne avec les millilitres', () => {
      expect(computeQuantity(200, 'ml')).toBe(720);
    });
    test('retourne un entier arrondi', () => {
      expect(Number.isInteger(computeQuantity(55, 'g'))).toBe(true);
    });
  });

  describe('aggregateIngredients()', () => {
    test('fusionne deux items identiques en sommant les quantités', () => {
      const items = [
        { name: 'Lentilles corail', qty: 720, unit: 'g', category: 'Légumineuses' },
        { name: 'Lentilles corail', qty: 360, unit: 'g', category: 'Légumineuses' },
      ];
      const result = aggregateIngredients(items);
      expect(result).toHaveLength(1);
      expect(result[0].qty).toBe(1080);
    });
    test('conserve les ingrédients de noms différents', () => {
      const items = [
        { name: 'Lentilles corail', qty: 720, unit: 'g', category: 'Légumineuses' },
        { name: 'Pois chiches',     qty: 540, unit: 'g', category: 'Légumineuses' },
      ];
      expect(aggregateIngredients(items)).toHaveLength(2);
    });
    test("ne fusionne pas des items d'unités différentes", () => {
      const items = [
        { name: 'Lait de coco', qty: 720, unit: 'ml',    category: 'Conserves' },
        { name: 'Lait de coco', qty: 1,   unit: 'boite', category: 'Conserves' },
      ];
      expect(aggregateIngredients(items)).toHaveLength(2);
    });
    test('retourne un tableau vide pour une entrée vide', () => {
      expect(aggregateIngredients([])).toHaveLength(0);
    });
  });

  describe('generateShoppingList()', () => {
    test("génère une liste à partir d'un menu et des recettes", () => {
      const result = generateShoppingList({ lun: 'r01', mar: 'r02' }, MOCK_RECIPES);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
    test('applique le coefficient famille sur chaque ingrédient', () => {
      const result = generateShoppingList({ lun: 'r01' }, MOCK_RECIPES);
      const lentilles = result.find(i => i.name === 'Lentilles corail');
      expect(lentilles.qty).toBe(720); // 200 × 3.6
    });
    test('agrège les ingrédients communs à plusieurs recettes', () => {
      // r01 + r02 ont chacun Lait de coco 200ml → (200 + 200) × 3.6 = 1440
      const result = generateShoppingList({ lun: 'r01', mar: 'r02' }, MOCK_RECIPES);
      const laitCoco = result.find(i => i.name === 'Lait de coco');
      expect(laitCoco.qty).toBe(1440);
    });
    test('un menu avec une seule recette donne N ingrédients sans doublon', () => {
      const result = generateShoppingList({ lun: 'r01' }, MOCK_RECIPES);
      expect(result.length).toBe(3); // r01 a 3 ingrédients
    });
    test('retourne un tableau vide pour un menu vide', () => {
      expect(generateShoppingList({}, MOCK_RECIPES)).toHaveLength(0);
    });
  });

  describe('groupByCategory()', () => {
    test('groupe les items par catégorie', () => {
      const items = [
        { name: 'Lentilles corail', qty: 720,  unit: 'g', category: 'Légumineuses' },
        { name: 'Pois chiches',     qty: 540,  unit: 'g', category: 'Légumineuses' },
        { name: 'Courgettes',       qty: 1080, unit: 'g', category: 'Légumes' },
      ];
      const result = groupByCategory(items);
      expect(result['Légumineuses']).toHaveLength(2);
      expect(result['Légumes']).toHaveLength(1);
    });
    test('retourne un objet vide pour une liste vide', () => {
      expect(Object.keys(groupByCategory([]))).toHaveLength(0);
    });
    test('chaque groupe contient les items complets', () => {
      const items = [{ name: 'Cumin moulu', qty: 18, unit: 'g', category: 'Épices' }];
      const result = groupByCategory(items);
      expect(result['Épices'][0].name).toBe('Cumin moulu');
      expect(result['Épices'][0].qty).toBe(18);
    });
  });

});
