// tests/unit/planning.test.js
// TDD — Sprint 3 : Module Planning (génération menus)
// RED phase : ces tests doivent échouer avant l'implémentation

import { RECIPES } from '../../js/data/recipes.js';
import {
    generateWeekMenu,
    validateMenu,
    countByType,
    assignRecipeToDay,
    removeRecipeFromDay,
    getWeekStart,
    formatWeekKey,
} from '../../js/modules/planning.js';

describe('Module Planning', () => {

    describe('generateWeekMenu()', () => {
        let menu;

        beforeEach(() => {
            menu = generateWeekMenu(RECIPES);
        });

        test('génère exactement 7 repas (un par jour)', () => {
            expect(Object.keys(menu)).toHaveLength(7);
        });

        test('contient maximum 3 recettes de viande', () => {
            const weekRecipes = Object.values(menu).map(id => RECIPES.find(r => r.id === id));
            const viandes = weekRecipes.filter(r => r && r.type === 'viande');
            expect(viandes.length).toBeLessThanOrEqual(3);
        });

        test('contient au minimum 4 recettes végétales', () => {
            const weekRecipes = Object.values(menu).map(id => RECIPES.find(r => r.id === id));
            const vegetaux = weekRecipes.filter(r => r && r.type === 'vegetal');
            expect(vegetaux.length).toBeGreaterThanOrEqual(4);
        });

        test('chaque recette ID référence une recette existante', () => {
            const ids = Object.values(menu);
            ids.forEach(id => {
                expect(RECIPES.find(r => r.id === id)).toBeDefined();
            });
        });

        test('ne répète pas deux fois la même recette', () => {
            const ids = Object.values(menu);
            const unique = new Set(ids);
            expect(unique.size).toBe(ids.length);
        });
    });

    describe('generateWeekMenu() — priorité pool favori', () => {
        test('priorise les recettes 5 étoiles par rapport aux autres', () => {
            const recipes5Stars = RECIPES.map(r =>
                r.id === 'r01' || r.id === 'r13' ? { ...r, stars: 5 } : { ...r, stars: 0 }
            );
            const menu = generateWeekMenu(recipes5Stars);
            const ids = Object.values(menu);
            // Les 2 recettes favorites doivent apparaître dans le menu
            expect(ids).toContain('r01');
            expect(ids).toContain('r13');
        });
    });

    describe('validateMenu()', () => {
        test('valide un menu respectant toutes les règles', () => {
            const menu = generateWeekMenu(RECIPES);
            expect(validateMenu(menu, RECIPES)).toBe(true);
        });

        test('invalide un menu avec plus de 3 viandes', () => {
            // Forcer 4 viandes dans le menu
            const badMenu = {
                'lun': 'r13', 'mar': 'r14', 'mer': 'r15', 'jeu': 'r16',
                'ven': 'r01', 'sam': 'r02', 'dim': 'r03',
            };
            expect(validateMenu(badMenu, RECIPES)).toBe(false);
        });
    });

    describe('countByType()', () => {
        test('compte correctement par type dans un menu', () => {
            const menu = { 'lun': 'r01', 'mar': 'r13', 'mer': 'r02' };
            const counts = countByType(menu, RECIPES);
            expect(counts.vegetal).toBe(2);
            expect(counts.viande).toBe(1);
            expect(counts.poisson).toBe(0);
        });
    });

    describe('assignRecipeToDay() / removeRecipeFromDay()', () => {
        test('assigne une recette à un jour', () => {
            const plan = {};
            const updated = assignRecipeToDay(plan, '2026-03-02', 'r01');
            expect(updated['2026-03-02']).toBe('r01');
        });

        test('supprime une recette d\'un jour', () => {
            const plan = { '2026-03-02': 'r01' };
            const updated = removeRecipeFromDay(plan, '2026-03-02');
            expect(updated['2026-03-02']).toBeUndefined();
        });

        test('ne modifie pas les autres jours lors d\'une suppression', () => {
            const plan = { '2026-03-02': 'r01', '2026-03-03': 'r02' };
            const updated = removeRecipeFromDay(plan, '2026-03-02');
            expect(updated['2026-03-03']).toBe('r02');
        });
    });

    describe('getWeekStart()', () => {
        test('retourne le lundi de la semaine courante avec offset 0', () => {
            const start = getWeekStart(0);
            expect(start.getDay()).toBe(1); // 1 = lundi
        });

        test('retourne le lundi de la semaine suivante avec offset 1', () => {
            const curr = getWeekStart(0);
            const next = getWeekStart(1);
            const diff = (next - curr) / (1000 * 60 * 60 * 24);
            expect(diff).toBe(7);
        });
    });

});
