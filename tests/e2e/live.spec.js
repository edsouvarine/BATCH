// tests/e2e/live.spec.js
// Tests grandeur nature — site en production (GitHub Pages)
// URL cible : https://edsouvarine.github.io/BATCH/

import { test, expect } from '@playwright/test';

const URL = 'https://edsouvarine.github.io/BATCH/';

// ── SETUP ─────────────────────────────────────────────────────────────────
test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.day-col');
});

// ── CHARGEMENT INITIAL ─────────────────────────────────────────────────────
test.describe('Chargement initial', () => {
  test('la page se charge et affiche le planning', async ({ page }) => {
    await expect(page.locator('#page-planning')).toHaveClass(/active/);
    await expect(page.locator('#week-label')).toContainText('Semaine du');
    await expect(page.locator('.day-col')).toHaveCount(7);
  });

  test('menu auto-généré dès la première visite (7 repas)', async ({ page }) => {
    await expect(page.locator('.meal-card:not(.empty)')).toHaveCount(7);
  });

  test('catalogue des 20 recettes accessible immédiatement', async ({ page }) => {
    await page.click('[data-page="recettes"]');
    await page.waitForSelector('.recipe-card');
    await expect(page.locator('.recipe-card')).toHaveCount(20);
  });
});

// ── NAVIGATION COMPLÈTE ────────────────────────────────────────────────────
test.describe('Navigation', () => {
  test('tous les onglets sont accessibles', async ({ page }) => {
    for (const p of ['recettes', 'courses', 'commander', 'batch']) {
      await page.click(`[data-page="${p}"]`);
      await expect(page.locator(`#page-${p}`)).toHaveClass(/active/);
    }
  });
});

// ── LISTE DE COURSES ───────────────────────────────────────────────────────
test.describe('Courses', () => {
  test.beforeEach(async ({ page }) => {
    await page.click('[data-page="courses"]');
    await page.waitForSelector('.category-group');
  });

  test('les deux enseignes affichent des articles dès le départ', async ({ page }) => {
    const koro   = await page.locator('#koro-count').textContent();
    const superu = await page.locator('#superu-count').textContent();
    expect(parseInt(koro)).toBeGreaterThan(0);
    expect(parseInt(superu)).toBeGreaterThan(0);
  });

  test('Koro contient au moins une catégorie d\'articles', async ({ page }) => {
    await expect(page.locator('#koro-list .category-group').first()).toBeVisible();
  });

  test('Super U contient au moins une catégorie d\'articles', async ({ page }) => {
    await expect(page.locator('#superu-list .category-group').first()).toBeVisible();
  });

  test('cocher un article Koro le marque visuellement', async ({ page }) => {
    const cb  = page.locator('#koro-list input[type="checkbox"]').first();
    const row = page.locator('#koro-list .ingredient-row').first();
    await cb.check();
    await expect(row).toHaveClass(/checked/);
  });

  test('cocher un article Super U le marque visuellement', async ({ page }) => {
    const cb  = page.locator('#superu-list input[type="checkbox"]').first();
    const row = page.locator('#superu-list .ingredient-row').first();
    await cb.check();
    await expect(row).toHaveClass(/checked/);
  });
});

// ── COMMANDER ─────────────────────────────────────────────────────────────
test.describe('Commander', () => {
  test.beforeEach(async ({ page }) => {
    await page.click('[data-page="commander"]');
    await page.waitForSelector('#order-koro-list');
  });

  test('la liste Koro est peuplée pour la commande', async ({ page }) => {
    const count = await page.locator('#order-koro-count').textContent();
    expect(parseInt(count)).toBeGreaterThan(0);
  });

  test('la liste Super U est peuplée pour la commande', async ({ page }) => {
    const count = await page.locator('#order-superu-count').textContent();
    expect(parseInt(count)).toBeGreaterThan(0);
  });

  test('les articles Koro affichent nom et quantité', async ({ page }) => {
    await expect(page.locator('#order-koro-list .ingredient-name').first()).toBeVisible();
    await expect(page.locator('#order-koro-list .ingredient-row input[type="text"]').first()).toBeVisible();
  });

  test('peut modifier la quantité d\'un article Koro', async ({ page }) => {
    const input = page.locator('#order-koro-list .ingredient-row input[type="text"]').first();
    await input.fill('999g');
    await expect(input).toHaveValue('999g');
  });

  test('peut supprimer un article Koro', async ({ page }) => {
    const before = await page.locator('#order-koro-list .ingredient-row').count();
    await page.locator('#order-koro-list .ingredient-row button').first().click();
    const after = await page.locator('#order-koro-list .ingredient-row').count();
    expect(after).toBe(before - 1);
  });

  test('peut ajouter un article manuellement à Koro', async ({ page }) => {
    const before = await page.locator('#order-koro-list .ingredient-row').count();
    page.on('dialog', async d => {
      if (d.message().includes('Nom')) await d.accept('Huile de coco');
      else await d.accept('500ml');
    });
    await page.locator('.add-ingredient-btn').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('#order-koro-list .ingredient-row')).toHaveCount(before + 1);
  });

  test('lancer la commande Koro déclenche une confirmation', async ({ page }) => {
    let dialogSeen = false;
    page.on('dialog', async d => { dialogSeen = true; await d.accept(); });
    await page.click('button:has-text("Lancer la commande Koro")');
    await page.waitForTimeout(500);
    expect(dialogSeen).toBe(true);
  });

  test('lancer la commande Super U déclenche une confirmation', async ({ page }) => {
    let dialogSeen = false;
    page.on('dialog', async d => { dialogSeen = true; await d.accept(); });
    await page.click('button:has-text("Lancer la commande Super U")');
    await page.waitForTimeout(500);
    expect(dialogSeen).toBe(true);
  });
});

// ── BATCH DU LUNDI ────────────────────────────────────────────────────────
test.describe('Batch du Lundi', () => {
  test.beforeEach(async ({ page }) => {
    await page.click('[data-page="batch"]');
    await page.waitForSelector('.batch-step');
  });

  test('affiche 8 étapes planifiées', async ({ page }) => {
    await expect(page.locator('.batch-step')).toHaveCount(8);
  });

  test('progression démarre à 0/8', async ({ page }) => {
    await expect(page.locator('#batch-progress-text')).toContainText('0/8');
  });

  test('démarre un timer sur la première étape', async ({ page }) => {
    await page.locator('#page-batch .timer-btn').first().click();
    await expect(page.locator('#page-batch .timer-btn.running')).toHaveCount(1);
  });

  test('marque une étape comme faite et met à jour la progression', async ({ page }) => {
    await page.locator('#step-0 .timer-btn').nth(1).click();
    await expect(page.locator('#step-0')).toHaveClass(/done/);
    await expect(page.locator('#batch-progress-text')).toContainText('1/8');
  });
});

// ── PERSISTANCE ───────────────────────────────────────────────────────────
test.describe('Persistance', () => {
  test('le planning persiste après rechargement de page', async ({ page }) => {
    const before = await page.locator('.meal-card:not(.empty)').count();
    await page.reload();
    await page.waitForSelector('.day-col');
    const after = await page.locator('.meal-card:not(.empty)').count();
    expect(after).toBe(before);
  });
});
