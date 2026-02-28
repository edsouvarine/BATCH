// tests/e2e/app.spec.js
// Sprint 5 — Tests E2E parcours critiques BATCH

import { test, expect } from '@playwright/test';

// ── SETUP ──────────────────────────────────────────────────────────────────
test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // Attendre que le JS module ait fini de s'exécuter (contenu dynamique)
  await page.waitForSelector('.day-col');
});

// ── NAVIGATION ─────────────────────────────────────────────────────────────
test.describe('Navigation', () => {
  test('charge la page Planning par défaut', async ({ page }) => {
    await expect(page.locator('#page-planning')).toHaveClass(/active/);
    await expect(page.locator('#week-grid')).toBeVisible();
  });

  test('navigue vers Recettes', async ({ page }) => {
    await page.click('[data-page="recettes"]');
    await expect(page.locator('#page-recettes')).toHaveClass(/active/);
    await page.waitForSelector('.recipe-card');
    await expect(page.locator('#recipes-grid')).toBeVisible();
  });

  test('navigue vers Courses', async ({ page }) => {
    await page.click('[data-page="courses"]');
    await expect(page.locator('#page-courses')).toHaveClass(/active/);
    await expect(page.locator('#koro-list')).toBeVisible();
    await expect(page.locator('#superu-list')).toBeVisible();
  });

  test('navigue vers Commander', async ({ page }) => {
    await page.click('[data-page="commander"]');
    await expect(page.locator('#page-commander')).toHaveClass(/active/);
    await expect(page.locator('#order-koro-list')).toBeVisible();
  });

  test('navigue vers Batch Lundi', async ({ page }) => {
    await page.click('[data-page="batch"]');
    await expect(page.locator('#page-batch')).toHaveClass(/active/);
    await page.waitForSelector('.batch-step');
    await expect(page.locator('#batch-steps')).toBeVisible();
  });
});

// ── PLANNING ───────────────────────────────────────────────────────────────
test.describe('Planning', () => {
  test('affiche 7 colonnes jour', async ({ page }) => {
    await expect(page.locator('.day-col')).toHaveCount(7);
  });

  test('affiche le label de la semaine courante', async ({ page }) => {
    await expect(page.locator('#week-label')).toContainText('Semaine du');
  });

  test('navigue vers la semaine suivante', async ({ page }) => {
    const before = await page.locator('#week-label').textContent();
    await page.click('button:has-text("Semaine suiv.")');
    await expect(page.locator('#week-label')).not.toHaveText(before);
  });

  test('navigue vers la semaine précédente', async ({ page }) => {
    const before = await page.locator('#week-label').textContent();
    await page.click('button:has-text("Semaine préc.")');
    await expect(page.locator('#week-label')).not.toHaveText(before);
  });

  test('génère un menu de 7 repas via le bouton', async ({ page }) => {
    await page.click('button:has-text("Générer avec Claude")');
    await page.waitForTimeout(1500);
    await expect(page.locator('.meal-card:not(.empty)')).toHaveCount(7);
  });

  test('le menu généré respecte max 3 viandes', async ({ page }) => {
    await page.click('button:has-text("Générer avec Claude")');
    await page.waitForTimeout(1500);
    // Scoper au planning pour ne pas compter les cartes recettes des autres pages
    const count = await page.locator('#page-planning .tag-viande').count();
    expect(count).toBeLessThanOrEqual(3);
  });

  test('le menu généré respecte min 4 végétal', async ({ page }) => {
    await page.click('button:has-text("Générer avec Claude")');
    await page.waitForTimeout(1500);
    const count = await page.locator('#page-planning .tag-vegetal').count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('supprime un repas au clic sur la carte', async ({ page }) => {
    await page.click('button:has-text("Générer avec Claude")');
    await page.waitForTimeout(1500);
    page.on('dialog', d => d.accept());
    await page.locator('.meal-card:not(.empty)').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('.meal-card.empty')).toHaveCount(1);
  });
});

// ── RECETTES ───────────────────────────────────────────────────────────────
test.describe('Recettes', () => {
  test.beforeEach(async ({ page }) => {
    await page.click('[data-page="recettes"]');
    await page.waitForSelector('.recipe-card');
  });

  test('affiche 20 recettes par défaut', async ({ page }) => {
    await expect(page.locator('.recipe-card')).toHaveCount(20);
  });

  test('filtre les recettes végétales', async ({ page }) => {
    await page.click('button:has-text("Végétal")');
    await expect(page.locator('.recipe-card')).toHaveCount(12);
  });

  test('filtre les recettes viande', async ({ page }) => {
    await page.click('button:has-text("Viande")');
    await expect(page.locator('.recipe-card')).toHaveCount(5);
  });

  test('filtre les recettes poisson', async ({ page }) => {
    await page.click('button:has-text("Poisson")');
    await expect(page.locator('.recipe-card')).toHaveCount(3);
  });

  test('retour à "Toutes" après un filtre', async ({ page }) => {
    await page.click('button:has-text("Viande")');
    await page.click('.filter-btn:has-text("Toutes")');
    await expect(page.locator('.recipe-card')).toHaveCount(20);
  });

  test('note une recette via les étoiles', async ({ page }) => {
    // r01 a stars=5 par défaut — on clique la 3e étoile pour passer à 3
    await page.locator('#stars-r01 span').nth(2).click();
    await expect(page.locator('#stars-r01 span.active')).toHaveCount(3);
  });

  test('ouvre la fiche technique d\'une recette', async ({ page }) => {
    await page.click('.recipe-card:first-child button:has-text("Voir & modifier")');
    await expect(page.locator('#modal-recipe')).toHaveClass(/open/);
    await expect(page.locator('#recipe-detail-content')).toBeVisible();
  });

  test('ferme la fiche technique', async ({ page }) => {
    await page.click('.recipe-card:first-child button:has-text("Voir & modifier")');
    await page.click('#modal-recipe button:has-text("Fermer")');
    await expect(page.locator('#modal-recipe')).not.toHaveClass(/open/);
  });

  test('ouvre la modale "Proposer une recette"', async ({ page }) => {
    await page.click('button:has-text("Proposer une recette")');
    await expect(page.locator('#modal-proposal')).toHaveClass(/open/);
  });
});

// ── COURSES ────────────────────────────────────────────────────────────────
test.describe('Courses', () => {
  test.beforeEach(async ({ page }) => {
    await page.click('button:has-text("Générer avec Claude")');
    await page.waitForTimeout(1500);
    await page.click('[data-page="courses"]');
    // Attendre que la liste soit peuplée (contenu dynamique)
    await page.waitForSelector('.category-group');
  });

  test('affiche les panneaux Koro et Super U', async ({ page }) => {
    // Scoper à la page courses uniquement
    await expect(page.locator('#page-courses .shop-panel')).toHaveCount(2);
  });

  test('la liste Koro contient des articles', async ({ page }) => {
    const text = await page.locator('#koro-count').textContent();
    expect(parseInt(text)).toBeGreaterThan(0);
  });

  test('la liste Super U contient des articles', async ({ page }) => {
    const text = await page.locator('#superu-count').textContent();
    expect(parseInt(text)).toBeGreaterThan(0);
  });

  test('cocher un article le marque visuellement', async ({ page }) => {
    const firstCheckbox = page.locator('#koro-list input[type="checkbox"]').first();
    const firstRow      = page.locator('#koro-list .ingredient-row').first();
    await firstCheckbox.check();
    await expect(firstRow).toHaveClass(/checked/);
  });
});

// ── BATCH ──────────────────────────────────────────────────────────────────
test.describe('Batch du Lundi', () => {
  test.beforeEach(async ({ page }) => {
    await page.click('[data-page="batch"]');
    await page.waitForSelector('.batch-step');
  });

  test('affiche 8 étapes de batch', async ({ page }) => {
    await expect(page.locator('.batch-step')).toHaveCount(8);
  });

  test('affiche la progression "0/8 étapes complétées"', async ({ page }) => {
    await expect(page.locator('#batch-progress-text')).toContainText('0/8');
  });

  test('démarre un timer sur une étape', async ({ page }) => {
    await page.locator('#page-batch .timer-btn').first().click();
    await expect(page.locator('#page-batch .timer-btn.running')).toHaveCount(1);
  });

  test('marque une étape comme faite', async ({ page }) => {
    await page.locator('#step-0 .timer-btn').nth(1).click();
    await expect(page.locator('#step-0')).toHaveClass(/done/);
    await expect(page.locator('#batch-progress-text')).toContainText('1/8');
  });

  test('réinitialise toutes les étapes', async ({ page }) => {
    await page.locator('#step-0 .timer-btn').nth(1).click();
    page.on('dialog', d => d.accept());
    await page.click('button:has-text("Réinitialiser")');
    await page.waitForTimeout(200);
    await expect(page.locator('#batch-progress-text')).toContainText('0/8');
  });
});

// ── PERSISTANCE ────────────────────────────────────────────────────────────
test.describe('Persistance localStorage', () => {
  test('le plan de la semaine persiste après rechargement', async ({ page }) => {
    await page.click('button:has-text("Générer avec Claude")');
    await page.waitForTimeout(1500);
    const before = await page.locator('.meal-card:not(.empty)').count();
    await page.reload();
    await page.waitForSelector('.day-col');
    const after = await page.locator('.meal-card:not(.empty)').count();
    expect(after).toBe(before);
  });

  test('les notes de recettes persistent après rechargement', async ({ page }) => {
    await page.click('[data-page="recettes"]');
    await page.waitForSelector('.recipe-card');
    await page.locator('#stars-r01 span').nth(2).click(); // → 3 étoiles
    await page.reload();
    await page.waitForSelector('.day-col');
    await page.click('[data-page="recettes"]');
    await page.waitForSelector('.recipe-card');
    await expect(page.locator('#stars-r01 span.active')).toHaveCount(3);
  });
});
