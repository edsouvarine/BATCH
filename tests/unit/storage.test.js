// tests/unit/storage.test.js
// TDD — Sprint 1 : Persistance LocalStorage
// RED phase : ces tests doivent échouer avant l'implémentation
// Note: utilise un mock de localStorage adapté à Node.js

import { Storage } from '../../js/services/storage.js';

// Mock localStorage pour Node.js
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();
global.localStorage = localStorageMock;

describe('Storage — persistance LocalStorage', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    describe('savePlan / loadPlan', () => {
        test('sauvegarde et recharge un plan semaine', () => {
            const plan = { '2026-03-02': 'r01', '2026-03-03': 'r13' };
            Storage.savePlan(plan);
            expect(Storage.loadPlan()).toEqual(plan);
        });

        test('retourne un objet vide si aucun plan sauvegardé', () => {
            expect(Storage.loadPlan()).toEqual({});
        });

        test('écrase l\'ancien plan lors d\'une nouvelle sauvegarde', () => {
            Storage.savePlan({ '2026-03-02': 'r01' });
            Storage.savePlan({ '2026-03-02': 'r05' });
            expect(Storage.loadPlan()).toEqual({ '2026-03-02': 'r05' });
        });
    });

    describe('saveRecipes / loadRecipes', () => {
        test('sauvegarde et recharge les recettes avec leurs notes', () => {
            const ratings = { r01: 5, r02: 4, r13: 5 };
            Storage.saveRatings(ratings);
            expect(Storage.loadRatings()).toEqual(ratings);
        });

        test('retourne un objet vide si aucune note sauvegardée', () => {
            expect(Storage.loadRatings()).toEqual({});
        });
    });

    describe('saveCustomRecipes / loadCustomRecipes', () => {
        test('sauvegarde une recette créée par l\'utilisateur', () => {
            const recipe = {
                id: 'custom-1',
                name: 'Gratin de courgettes',
                type: 'vegetal',
                origin: 'user',
                stars: 0,
            };
            Storage.saveCustomRecipes([recipe]);
            const loaded = Storage.loadCustomRecipes();
            expect(loaded).toHaveLength(1);
            expect(loaded[0].name).toBe('Gratin de courgettes');
        });

        test('retourne un tableau vide si aucune recette personnalisée', () => {
            expect(Storage.loadCustomRecipes()).toEqual([]);
        });
    });

    describe('saveCheckedItems / loadCheckedItems', () => {
        test('sauvegarde les articles cochés dans la liste de courses', () => {
            const checked = { 'koro-Légumineuses-0': true, 'superu-Crémerie-1': true };
            Storage.saveCheckedItems(checked);
            expect(Storage.loadCheckedItems()).toEqual(checked);
        });

        test('retourne un objet vide si rien n\'est coché', () => {
            expect(Storage.loadCheckedItems()).toEqual({});
        });
    });

    describe('clearAll', () => {
        test('efface toutes les données sauvegardées', () => {
            Storage.savePlan({ '2026-03-02': 'r01' });
            Storage.saveRatings({ r01: 5 });
            Storage.clearAll();
            expect(Storage.loadPlan()).toEqual({});
            expect(Storage.loadRatings()).toEqual({});
        });
    });

});
