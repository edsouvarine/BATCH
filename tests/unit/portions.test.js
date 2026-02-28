// tests/unit/portions.test.js
// TDD — Sprint 1 : Calcul des portions par membre de la famille
// RED phase : ces tests doivent échouer avant l'implémentation

import { calculatePortions, FAMILY_MEMBERS, getTotalMultiplier } from '../../js/utils/portions.js';

describe('Calcul des portions familiales', () => {

    describe('FAMILY_MEMBERS', () => {
        test('la famille comporte 4 membres', () => {
            expect(FAMILY_MEMBERS).toHaveLength(4);
        });

        test('Nico est un adulte avec multiplicateur 1.0', () => {
            const nico = FAMILY_MEMBERS.find(m => m.name === 'Nico');
            expect(nico).toBeDefined();
            expect(nico.type).toBe('adulte');
            expect(nico.multiplier).toBe(1.0);
        });

        test('Flo est une adulte avec multiplicateur 1.0', () => {
            const flo = FAMILY_MEMBERS.find(m => m.name === 'Flo');
            expect(flo).toBeDefined();
            expect(flo.type).toBe('adulte');
            expect(flo.multiplier).toBe(1.0);
        });

        test('Sacha est un enfant avec multiplicateur 0.8 (12 ans)', () => {
            const sacha = FAMILY_MEMBERS.find(m => m.name === 'Sacha');
            expect(sacha).toBeDefined();
            expect(sacha.type).toBe('enfant');
            expect(sacha.multiplier).toBe(0.8);
            expect(sacha.age).toBe(12);
        });

        test('Victor est un enfant avec multiplicateur 0.8 (9 ans)', () => {
            const victor = FAMILY_MEMBERS.find(m => m.name === 'Victor');
            expect(victor).toBeDefined();
            expect(victor.type).toBe('enfant');
            expect(victor.multiplier).toBe(0.8);
            expect(victor.age).toBe(9);
        });
    });

    describe('getTotalMultiplier()', () => {
        test('multiplicateur total famille = 3.6 (1.0 + 1.0 + 0.8 + 0.8)', () => {
            expect(getTotalMultiplier()).toBeCloseTo(3.6);
        });
    });

    describe('calculatePortions()', () => {
        test('calcule la quantité totale pour 100g adulte référence', () => {
            // 100g × 3.6 = 360g
            expect(calculatePortions(100)).toBeCloseTo(360);
        });

        test('calcule la quantité totale pour 150g adulte référence', () => {
            // 150g × 3.6 = 540g
            expect(calculatePortions(150)).toBeCloseTo(540);
        });

        test('retourne 0 pour une quantité nulle', () => {
            expect(calculatePortions(0)).toBe(0);
        });

        test('retourne la valeur en grammes arrondie à l\'entier', () => {
            const result = calculatePortions(100);
            expect(Number.isInteger(result)).toBe(true);
        });

        test('accepte un multiplicateur personnalisé (ex: pour 1 adulte seulement)', () => {
            expect(calculatePortions(100, 1.0)).toBe(100);
        });

        test('accepte un membre spécifique en entrée', () => {
            const result = calculatePortions(100, null, 'Sacha');
            expect(result).toBeCloseTo(80); // 100 × 0.8
        });
    });

});
