// tests/unit/recipes.test.js
// TDD — Sprint 2 : Module Recettes
// RED phase : ces tests doivent échouer avant l'implémentation

import { RECIPES } from '../../js/data/recipes.js';
import {
    filterByType,
    filterByFavorites,
    filterByOrigin,
    rateRecipe,
    getFavoritePool,
    createRecipe,
    validateRecipe,
} from '../../js/modules/recipes.js';

describe('Module Recettes', () => {

    describe('RECIPES — catalogue de base', () => {
        test('le catalogue contient exactement 20 recettes', () => {
            expect(RECIPES).toHaveLength(20);
        });

        test('chaque recette a les champs obligatoires', () => {
            RECIPES.forEach(r => {
                expect(r).toHaveProperty('id');
                expect(r).toHaveProperty('name');
                expect(r).toHaveProperty('type');
                expect(r).toHaveProperty('season');
                expect(r).toHaveProperty('time');
                expect(r).toHaveProperty('stars');
                expect(r).toHaveProperty('origin');
            });
        });

        test('12 recettes végétales, 5 viandes, 3 poissons', () => {
            const vegetal = RECIPES.filter(r => r.type === 'vegetal');
            const viande = RECIPES.filter(r => r.type === 'viande');
            const poisson = RECIPES.filter(r => r.type === 'poisson');
            expect(vegetal).toHaveLength(12);
            expect(viande).toHaveLength(5);
            expect(poisson).toHaveLength(3);
        });

        test('toutes les recettes ont une note entre 0 et 5', () => {
            RECIPES.forEach(r => {
                expect(r.stars).toBeGreaterThanOrEqual(0);
                expect(r.stars).toBeLessThanOrEqual(5);
            });
        });
    });

    describe('filterByType()', () => {
        test('filtre les recettes végétales', () => {
            const result = filterByType(RECIPES, 'vegetal');
            expect(result.every(r => r.type === 'vegetal')).toBe(true);
        });

        test('filtre les recettes viande', () => {
            const result = filterByType(RECIPES, 'viande');
            expect(result.every(r => r.type === 'viande')).toBe(true);
        });

        test('retourne toutes les recettes pour le filtre "all"', () => {
            const result = filterByType(RECIPES, 'all');
            expect(result).toHaveLength(RECIPES.length);
        });
    });

    describe('filterByFavorites()', () => {
        test('retourne uniquement les recettes ≥ 5 étoiles', () => {
            const result = filterByFavorites(RECIPES);
            expect(result.every(r => r.stars >= 5)).toBe(true);
        });
    });

    describe('filterByOrigin()', () => {
        test('filtre les recettes d\'origine IA', () => {
            const mockRecipes = [
                { ...RECIPES[0], origin: 'ia' },
                { ...RECIPES[1], origin: 'catalogue' },
            ];
            const result = filterByOrigin(mockRecipes, 'ia');
            expect(result).toHaveLength(1);
            expect(result[0].origin).toBe('ia');
        });
    });

    describe('rateRecipe()', () => {
        test('met à jour la note d\'une recette', () => {
            const recipes = RECIPES.map(r => ({ ...r }));
            const updated = rateRecipe(recipes, 'r01', 5);
            const r01 = updated.find(r => r.id === 'r01');
            expect(r01.stars).toBe(5);
        });

        test('ne modifie pas les autres recettes', () => {
            const recipes = RECIPES.map(r => ({ ...r }));
            const original_r02_stars = recipes.find(r => r.id === 'r02').stars;
            rateRecipe(recipes, 'r01', 5);
            expect(recipes.find(r => r.id === 'r02').stars).toBe(original_r02_stars);
        });

        test('rejette une note hors plage [0-5]', () => {
            const recipes = RECIPES.map(r => ({ ...r }));
            expect(() => rateRecipe(recipes, 'r01', 6)).toThrow();
            expect(() => rateRecipe(recipes, 'r01', -1)).toThrow();
        });
    });

    describe('getFavoritePool()', () => {
        test('retourne uniquement les recettes 5 étoiles', () => {
            const pool = getFavoritePool(RECIPES);
            expect(pool.every(r => r.stars === 5)).toBe(true);
        });

        test('le pool favori est trié par type (végétal en priorité)', () => {
            const pool = getFavoritePool(RECIPES);
            if (pool.length > 1) {
                const vegetalIdx = pool.findIndex(r => r.type === 'vegetal');
                const viandeIdx = pool.findIndex(r => r.type === 'viande');
                if (vegetalIdx !== -1 && viandeIdx !== -1) {
                    expect(vegetalIdx).toBeLessThan(viandeIdx);
                }
            }
        });
    });

    describe('createRecipe()', () => {
        test('crée une recette avec les champs par défaut', () => {
            const newRecipe = createRecipe({ name: 'Gratin test', type: 'vegetal' });
            expect(newRecipe).toHaveProperty('id');
            expect(newRecipe.name).toBe('Gratin test');
            expect(newRecipe.type).toBe('vegetal');
            expect(newRecipe.stars).toBe(0);
            expect(newRecipe.origin).toBe('user');
        });

        test('génère un ID unique', () => {
            const r1 = createRecipe({ name: 'Recette 1', type: 'vegetal' });
            const r2 = createRecipe({ name: 'Recette 2', type: 'vegetal' });
            expect(r1.id).not.toBe(r2.id);
        });
    });

    describe('validateRecipe()', () => {
        test('valide une recette complète', () => {
            const valid = { name: 'Test', type: 'vegetal', season: ['toute'], time: '30 min' };
            expect(validateRecipe(valid)).toBe(true);
        });

        test('rejette une recette sans nom', () => {
            const invalid = { type: 'vegetal', season: ['toute'], time: '30 min' };
            expect(validateRecipe(invalid)).toBe(false);
        });

        test('rejette un type invalide', () => {
            const invalid = { name: 'Test', type: 'inconnu', season: ['toute'], time: '30 min' };
            expect(validateRecipe(invalid)).toBe(false);
        });
    });

});
