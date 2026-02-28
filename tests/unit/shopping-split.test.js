// tests/unit/shopping-split.test.js
// TDD — Sprint 1/4 : Répartition Koro / Super U
// RED phase : ces tests doivent échouer avant l'implémentation

import { assignStore, STORE_RULES, splitShoppingList } from '../../js/data/shopping.js';

describe('Répartition Koro / Super U', () => {

    describe('STORE_RULES — catégories Koro', () => {
        test('les lentilles vont chez Koro', () => {
            expect(assignStore('Lentilles corail')).toBe('koro');
        });

        test('le riz va chez Koro', () => {
            expect(assignStore('Riz basmati')).toBe('koro');
        });

        test('les pâtes vont chez Koro', () => {
            expect(assignStore('Pâtes')).toBe('koro');
        });

        test('la farine va chez Koro', () => {
            expect(assignStore('Farine de blé')).toBe('koro');
        });

        test('le cumin va chez Koro', () => {
            expect(assignStore('Cumin moulu')).toBe('koro');
        });

        test('l\'huile d\'olive va chez Koro', () => {
            expect(assignStore('Huile d\'olive')).toBe('koro');
        });

        test('les graines de courge vont chez Koro', () => {
            expect(assignStore('Graines de courge')).toBe('koro');
        });
    });

    describe('STORE_RULES — catégories Super U', () => {
        test('les œufs vont chez Super U', () => {
            expect(assignStore('Œufs')).toBe('superu');
        });

        test('le lait de coco va chez Super U', () => {
            expect(assignStore('Lait de coco')).toBe('superu');
        });

        test('les tomates concassées vont chez Super U', () => {
            expect(assignStore('Tomates concassées')).toBe('superu');
        });

        test('les courgettes vont chez Super U', () => {
            expect(assignStore('Courgettes')).toBe('superu');
        });

        test('le poulet va chez Super U', () => {
            expect(assignStore('Cuisses de poulet')).toBe('superu');
        });

        test('le beurre va chez Super U', () => {
            expect(assignStore('Beurre')).toBe('superu');
        });
    });

    describe('splitShoppingList()', () => {
        const mockList = [
            { name: 'Lentilles corail', qty: '360g' },
            { name: 'Courgettes', qty: '1kg' },
            { name: 'Huile d\'olive', qty: '50ml' },
            { name: 'Œufs', qty: '9 unités' },
        ];

        test('retourne un objet avec les clés koro et superu', () => {
            const result = splitShoppingList(mockList);
            expect(result).toHaveProperty('koro');
            expect(result).toHaveProperty('superu');
        });

        test('les lentilles et l\'huile sont chez Koro', () => {
            const result = splitShoppingList(mockList);
            const koroNames = result.koro.map(i => i.name);
            expect(koroNames).toContain('Lentilles corail');
            expect(koroNames).toContain('Huile d\'olive');
        });

        test('les courgettes et les œufs sont chez Super U', () => {
            const result = splitShoppingList(mockList);
            const superuNames = result.superu.map(i => i.name);
            expect(superuNames).toContain('Courgettes');
            expect(superuNames).toContain('Œufs');
        });

        test('aucun article n\'est perdu lors du split', () => {
            const result = splitShoppingList(mockList);
            const total = result.koro.length + result.superu.length;
            expect(total).toBe(mockList.length);
        });

        test('liste vide retourne deux listes vides', () => {
            const result = splitShoppingList([]);
            expect(result.koro).toHaveLength(0);
            expect(result.superu).toHaveLength(0);
        });
    });

});
