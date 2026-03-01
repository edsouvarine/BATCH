// js/app.js — Orchestrateur BATCH
import { RECIPES as BASE_RECIPES }                              from './data/recipes.js';
import { RECIPE_INGREDIENTS }                                   from './data/ingredients.js';
import { Storage }                                              from './services/storage.js';
import { generateWeekMenu }                                     from './modules/planning.js';
import { filterByType, filterByFavorites, filterByOrigin,
         rateRecipe as rateR }                                  from './modules/recipes.js';
import { generateShoppingList, groupByCategory }                from './modules/shopping.js';
import { assignStore }                                          from './data/shopping.js';

// ── DATA ─────────────────────────────────────────────────────
const DAYS_FR  = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const DAY_KEYS = ['lun','mar','mer','jeu','ven','sam','dim'];
const BATCH_STEPS = [
  { name: 'Cuire le dahl de lentilles',      tech: 'Mijoter à feu doux',        duration: '25 min', time: '14h00' },
  { name: 'Enfourner le poulet rôti',         tech: 'Four 180°C',                duration: '75 min', time: '14h05' },
  { name: 'Préparer la sauce tomate',         tech: 'Mijoter',                   duration: '20 min', time: '14h10' },
  { name: 'Former et dorer les boulettes',    tech: 'Saisir à feu vif',          duration: '15 min', time: '14h30' },
  { name: 'Couper et préparer les légumes',   tech: 'Julienne, brunoise',        duration: '30 min', time: '15h00' },
  { name: 'Cuire le riz pilaf',               tech: 'Absorption ratio 2:1',      duration: '20 min', time: '15h30' },
  { name: 'Sortir et effilocher le poulet',   tech: 'À la fourchette encore chaud', duration: '10 min', time: '16h20' },
  { name: 'Conditionner en portions',         tech: 'Boîtes hermétiques, étiqueter', duration: '15 min', time: '16h30' },
];

// ── STATE ─────────────────────────────────────────────────────
let ratings        = Storage.loadRatings();
let currentRecipes = BASE_RECIPES
  .map(r => ({ ...r, stars: ratings[r.id] ?? r.stars, ingredients: RECIPE_INGREDIENTS[r.id] || [] }));
let weekPlan       = Storage.loadPlan();
let checkedItems   = Storage.loadCheckedItems();
let shoppingData   = { koro: {}, superu: {} };
let currentWeekOffset = 0;
let activeTimers   = {};
let completedSteps = {};
let filterActive   = 'all';
let selectedType   = 'vegetal';

// ── HELPERS ───────────────────────────────────────────────────
function getWeekStart(offset) {
  const d = new Date(); const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1 + offset * 7); return d;
}
function formatWeekLabel(d) {
  const end = new Date(d); end.setDate(d.getDate() + 6);
  const fmt = dt => dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  return `Semaine du ${fmt(d)} au ${fmt(end)} ${end.getFullYear()}`;
}
function typeIcon(type) { return type === 'vegetal' ? '🥦' : type === 'viande' ? '🥩' : '🐟'; }
function buildShoppingData() {
  const items = generateShoppingList(weekPlan, currentRecipes);
  const result = { koro: {}, superu: {} };
  for (const item of items) {
    const store = assignStore(item.name);
    if (!result[store][item.category]) result[store][item.category] = [];
    result[store][item.category].push({ name: item.name, qty: `${item.qty}${item.unit}` });
  }
  return result;
}

// ── NAVIGATION ────────────────────────────────────────────────
function navigate(el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  el.classList.add('active');
  const target = document.getElementById('page-' + el.dataset.page);
  target.classList.add('active');
  target.style.display = 'block';
}

// ── PLANNING ──────────────────────────────────────────────────
function renderPlanning() {
  const ws = getWeekStart(currentWeekOffset);
  document.getElementById('week-label').textContent = formatWeekLabel(ws);
  const grid = document.getElementById('week-grid'); grid.innerHTML = '';
  const today = new Date().toDateString();
  DAYS_FR.forEach((day, i) => {
    const date = new Date(ws); date.setDate(ws.getDate() + i);
    const key = date.toDateString(); const r = currentRecipes.find(r => r.id === weekPlan[key]);
    const col = document.createElement('div'); col.className = 'day-col';
    col.innerHTML = `<div class="day-header${date.toDateString() === today ? ' today' : ''}">${day}<br><small style="font-weight:400">${date.getDate()}/${date.getMonth() + 1}</small></div>`;
    const card = document.createElement('div');
    if (r) {
      card.className = 'meal-card';
      card.innerHTML = `<div class="meal-name">${r.name}</div><div class="meal-footer"><span class="tag tag-${r.type}">${typeIcon(r.type)} ${r.type}</span><span class="stars">${'⭐'.repeat(r.stars)}</span></div>`;
      card.onclick = () => removeMeal(key); card.title = 'Cliquer pour supprimer';
    } else {
      card.className = 'meal-card empty'; card.textContent = '+';
      card.onclick = () => pickRecipe(key); card.title = 'Ajouter une recette';
    }
    col.appendChild(card); grid.appendChild(col);
  });
}
function prevWeek() { currentWeekOffset--; renderPlanning(); }
function nextWeek()  { currentWeekOffset++; renderPlanning(); }
function pickRecipe(dateKey) {
  const choice = currentRecipes.map((r, i) => `${i + 1}. ${r.name} (${r.type})`).join('\n');
  const num = prompt(`Choisir une recette (1-${currentRecipes.length}):\n\n${choice}`);
  const idx = parseInt(num) - 1;
  if (idx >= 0 && idx < currentRecipes.length) {
    weekPlan[dateKey] = currentRecipes[idx].id; Storage.savePlan(weekPlan);
    renderPlanning(); renderShopping();
  }
}
function removeMeal(dateKey) {
  if (confirm('Supprimer ce repas ?')) {
    delete weekPlan[dateKey]; Storage.savePlan(weekPlan); renderPlanning(); renderShopping();
  }
}
function generateMenu() {
  const btn = document.querySelector('[onclick="generateMenu()"]');
  btn.textContent = '⏳ Génération...'; btn.disabled = true;
  setTimeout(() => {
    const menu = generateWeekMenu(currentRecipes); const ws = getWeekStart(currentWeekOffset);
    DAY_KEYS.forEach((dk, i) => {
      if (menu[dk]) { const d = new Date(ws); d.setDate(ws.getDate() + i); weekPlan[d.toDateString()] = menu[dk]; }
    });
    Storage.savePlan(weekPlan); renderPlanning(); renderShopping();
    btn.textContent = '✨ Générer avec Claude'; btn.disabled = false;
  }, 1200);
}

// ── RECETTES ──────────────────────────────────────────────────
function getFiltered(f) {
  if (f === 'vegetal') return filterByType(currentRecipes, 'vegetal');
  if (f === 'viande')  return filterByType(currentRecipes, 'viande');
  if (f === 'poisson') return filterByType(currentRecipes, 'poisson');
  if (f === 'favoris') return filterByFavorites(currentRecipes);
  if (f === 'ia')      return filterByOrigin(currentRecipes, 'ia');
  return currentRecipes;
}
function renderRecipes(filter) {
  document.getElementById('recipes-grid').innerHTML = getFiltered(filter).map(r => `
    <div class="recipe-card">
      <div class="recipe-name">${r.name}</div>
      <div class="recipe-meta">
        <span class="tag tag-${r.type}">${typeIcon(r.type)} ${r.type}</span>
        ${r.origin === 'ia' ? '<span class="tag tag-ia">✨ IA</span>' : ''}
      </div>
      <div class="recipe-footer">
        <div class="recipe-time">⏱ ${r.time}</div>
        <div class="star-rate" id="stars-${r.id}">${[1,2,3,4,5].map(s =>
          `<span class="${s <= r.stars ? 'active' : ''}" onclick="event.stopPropagation();rateRecipe('${r.id}',${s})">★</span>`).join('')}</div>
      </div>
      <div class="recipe-card-actions">
        <button class="btn btn-outline btn-sm" style="flex:1" onclick="openRecipeDetail('${r.id}')">✏️ Voir & modifier</button>
        <button class="btn btn-green btn-sm" onclick="addToPlanning('${r.id}')">📅 Planning</button>
      </div>
    </div>`).join('');
}
function filterRecipes(f, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); filterActive = f; renderRecipes(f);
}
function rateRecipe(id, stars) {
  currentRecipes = rateR(currentRecipes, id, stars);
  ratings[id] = stars; Storage.saveRatings(ratings); renderRecipes(filterActive);
}
function addToPlanning(id) { alert('📅 Allez dans le Planning pour choisir le jour.'); }
function aiDiscovery()     { alert('✨ Fonctionnalité disponible avec la clé API Claude.'); }

// ── MODAL PROPOSER ────────────────────────────────────────────
const TPL = {
  vegetal:  () => ({ ingredients: [{ name: 'Légumes de saison', qty: '400g', store: 'superu' }, { name: 'Huile d\'olive', qty: '20ml', store: 'koro' }], batchSteps: ['Laver et couper les légumes', 'Cuire et conditionner'], finition: 'Réchauffer 5 min', time: '30 min' }),
  viande:   () => ({ ingredients: [{ name: 'Viande', qty: '160g', store: 'superu' }, { name: 'Légumes', qty: '200g', store: 'superu' }], batchSteps: ['Saisir la viande', 'Mijoter 25 min', 'Conditionner'], finition: 'Réchauffer + accompagnement', time: '45 min' }),
  poisson:  () => ({ ingredients: [{ name: 'Filet de poisson', qty: '150g', store: 'superu' }, { name: 'Citron', qty: '1/2', store: 'superu' }], batchSteps: ['Préparer légumes vapeur'], finition: 'Cuire le poisson jour J', time: '20 min' }),
};
function openProposalModal() {
  document.getElementById('prop-name').value = '';
  document.getElementById('prop-desc').value = '';
  document.getElementById('generating-bar').classList.remove('show');
  selectType('vegetal'); document.getElementById('modal-proposal').classList.add('open');
}
function selectType(t) {
  selectedType = t;
  ['vegetal','viande','poisson'].forEach(type =>
    document.getElementById('type-' + type).className = 'type-btn' + (type === t ? ' selected-' + type : ''));
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }
function generateFicheTech() {
  const name = document.getElementById('prop-name').value.trim();
  if (!name) { alert('Veuillez saisir un nom de recette !'); return; }
  const bar = document.getElementById('generating-bar'); bar.classList.add('show');
  document.querySelector('#modal-proposal .btn-primary').disabled = true;
  setTimeout(() => {
    bar.classList.remove('show'); closeModal('modal-proposal');
    const tpl = TPL[selectedType](); const saison = document.getElementById('prop-saison').value;
    const newR = { id: `user-${Date.now()}`, name, type: selectedType, season: [saison], time: tpl.time, stars: 0, origin: 'user', ingredients: tpl.ingredients, batchSteps: tpl.batchSteps, finition: tpl.finition };
    currentRecipes.push(newR);
    const custom = Storage.loadCustomRecipes(); custom.push(newR); Storage.saveCustomRecipes(custom);
    renderRecipes(filterActive);
    document.querySelector('#modal-proposal .btn-primary').disabled = false;
    setTimeout(() => openRecipeDetail(newR.id), 100);
  }, 1800);
}

// ── FICHE TECHNIQUE ───────────────────────────────────────────
function openRecipeDetail(id) {
  const r = currentRecipes.find(r => r.id === id); if (!r) return;
  const ings  = r.ingredients?.length ? r.ingredients : [{ name: 'Ingrédient 1', qty: '100g', store: 'superu' }];
  const steps = r.batchSteps || ['Préparer les ingrédients', 'Cuire et conditionner'];
  const fin   = r.finition   || 'Réchauffer et servir';
  document.getElementById('recipe-detail-content').innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px">
      <div><div style="font-size:20px;font-weight:700;margin-bottom:6px" contenteditable="true" onblur="saveField('${id}','name',this.textContent)">${r.name}</div>
        <div style="display:flex;gap:8px"><span class="tag tag-${r.type}">${typeIcon(r.type)} ${r.type}</span>
          ${r.origin==='user'?'<span class="tag tag-ia">✍️ Ma recette</span>':r.origin==='ia'?'<span class="tag tag-ia">✨ IA</span>':''}
          <span style="font-size:12px;color:var(--text-muted)">⏱ ${r.time}</span></div></div>
      <div class="star-rate" style="font-size:20px">${[1,2,3,4,5].map(s=>
        `<span class="${s<=r.stars?'active':''}" onclick="rateRecipe('${id}',${s});openRecipeDetail('${id}')">★</span>`).join('')}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:24px">
      <div class="editable-field" onclick="editInline(this,'time')"><span class="field-label">⏱ Temps</span><span class="field-value">${r.time}</span><span class="edit-icon">✏️</span></div>
      <div class="editable-field" onclick="editInline(this,'season')"><span class="field-label">🌿 Saison</span><span class="field-value">${Array.isArray(r.season)?r.season.join(', '):r.season}</span><span class="edit-icon">✏️</span></div>
    </div>
    <div class="fiche-section"><div class="fiche-section-title">🛒 Ingrédients (1 adulte)</div>
      <div id="detail-ingredients">${ings.map((ing,i)=>`
        <div class="ingredient-edit-row" id="ing-row-${i}">
          <input value="${ing.name}" placeholder="Ingrédient" onchange="updateIngredient('${id}',${i},'name',this.value)"/>
          <input class="qty-input" value="${ing.qty||(ing.qty+''+(ing.unit||''))}" placeholder="Qtité" onchange="updateIngredient('${id}',${i},'qty',this.value)"/>
          <select class="store-select" onchange="updateIngredient('${id}',${i},'store',this.value)">
            <option value="koro" ${ing.store==='koro'?'selected':''}>🟡 Koro</option>
            <option value="superu" ${ing.store!=='koro'?'selected':''}>🔴 Super U</option>
          </select>
          <button class="del-btn" onclick="removeIngredient('${id}',${i})">×</button>
        </div>`).join('')}</div>
      <button class="add-ingredient-btn" onclick="addIngredient('${id}')">+ Ajouter un ingrédient</button>
    </div>
    <div class="fiche-section"><div class="fiche-section-title">🍳 Étapes Batch</div>
      <div id="detail-batch">${steps.map((s,i)=>`
        <div class="batch-step-edit"><span style="width:20px;text-align:center;font-size:12px;color:var(--text-muted);padding-top:8px">${i+1}</span>
          <textarea onblur="updateBatchStep('${id}',${i},this.value)">${s}</textarea>
          <button class="del-btn" onclick="removeBatchStep('${id}',${i})">×</button></div>`).join('')}</div>
      <button class="add-ingredient-btn" onclick="addBatchStep('${id}')">+ Ajouter une étape</button>
    </div>
    <div class="fiche-section"><div class="fiche-section-title">✅ Finition Jour J</div>
      <textarea class="form-input form-textarea" style="min-height:60px" onblur="saveField('${id}','finition',this.value)">${fin}</textarea>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button class="btn btn-outline" style="flex:1" onclick="closeModal('modal-recipe')">Fermer</button>
      <button class="btn btn-primary" style="flex:1" onclick="closeModal('modal-recipe');renderRecipes(filterActive)">✅ Sauvegarder</button>
    </div>`;
  document.getElementById('modal-recipe').classList.add('open');
}
function saveField(id, field, value)          { const r = currentRecipes.find(r=>r.id===id); if(r) r[field]=value; }
function updateIngredient(id, idx, f, value)  { const r = currentRecipes.find(r=>r.id===id); if(r?.ingredients) r.ingredients[idx][f]=value; }
function removeIngredient(id, idx)            { const r = currentRecipes.find(r=>r.id===id); if(r?.ingredients){r.ingredients.splice(idx,1);openRecipeDetail(id);} }
function addIngredient(id)                    { const r = currentRecipes.find(r=>r.id===id); if(!r.ingredients)r.ingredients=[]; r.ingredients.push({name:'',qty:'',store:'superu'}); openRecipeDetail(id); }
function updateBatchStep(id, idx, value)      { const r = currentRecipes.find(r=>r.id===id); if(r?.batchSteps) r.batchSteps[idx]=value; }
function removeBatchStep(id, idx)             { const r = currentRecipes.find(r=>r.id===id); if(r?.batchSteps){r.batchSteps.splice(idx,1);openRecipeDetail(id);} }
function addBatchStep(id)                     { const r = currentRecipes.find(r=>r.id===id); if(!r.batchSteps)r.batchSteps=[]; r.batchSteps.push('Nouvelle étape...'); openRecipeDetail(id); }
function editInline(el) {
  const valEl = el.querySelector('.field-value'); const input = document.createElement('input');
  input.value = valEl.textContent; input.className = 'form-input'; input.style.cssText = 'padding:4px 8px;font-size:13px';
  valEl.replaceWith(input); input.focus(); el.querySelector('.edit-icon').style.display = 'none';
  input.onblur = () => { const span = document.createElement('span'); span.className = 'field-value'; span.textContent = input.value; input.replaceWith(span); el.querySelector('.edit-icon').style.display = ''; };
}

// ── COURSES ───────────────────────────────────────────────────
function renderShopPanel(shop, listId, countId, editable = false) {
  const el = document.getElementById(listId); const countEl = document.getElementById(countId);
  if (!el) return; let total = 0;
  el.innerHTML = Object.entries(shoppingData[shop]).map(([cat, items]) => {
    total += items.length;
    return `<div class="category-group"><div class="category-label">${cat}</div>${items.map((item,idx)=>{
      const key = `${editable?'order-':''}${shop}-${cat}-${idx}`; const done = checkedItems[key];
      return `<div class="ingredient-row ${done?'checked':''}" id="row-${key}">
        <input type="checkbox" ${done?'checked':''} onchange="toggleItem('${key}')">
        <span class="ingredient-name">${item.name}</span>
        ${editable
          ? `<input type="text" value="${item.qty}" style="width:80px;background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:2px 6px;color:var(--text);font-size:12px;text-align:right;font-family:inherit" onchange="updateOrderQty('${shop}','${cat}',${idx},this.value)" onclick="event.stopPropagation()">
             <button onclick="removeOrderItem('${shop}','${cat}',${idx})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;padding:0 4px" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--text-muted)'">×</button>`
          : `<span class="ingredient-qty">${item.qty}</span>`}
      </div>`;
    }).join('')}</div>`;
  }).join('') || '<div style="padding:16px;color:var(--text-muted);text-align:center;font-size:13px">Planifiez des repas pour voir la liste 📋</div>';
  if (countEl) countEl.textContent = `${total} articles`;
}
function renderShoppingPanels() {
  renderShopPanel('koro',   'koro-list',         'koro-count');
  renderShopPanel('superu', 'superu-list',        'superu-count');
  renderShopPanel('koro',   'order-koro-list',   'order-koro-count',   true);
  renderShopPanel('superu', 'order-superu-list', 'order-superu-count', true);
}
function renderShopping() {
  shoppingData = buildShoppingData();
  renderShoppingPanels();
}
function toggleItem(key) {
  checkedItems[key] = !checkedItems[key]; Storage.saveCheckedItems(checkedItems);
  document.getElementById('row-' + key).classList.toggle('checked', checkedItems[key]);
}
function renderOrderSummary() { renderShopping(); }
function updateOrderQty(shop, cat, idx, val) { if(shoppingData[shop][cat]?.[idx]) shoppingData[shop][cat][idx].qty=val; }
function removeOrderItem(shop, cat, idx) { if(shoppingData[shop][cat]){shoppingData[shop][cat].splice(idx,1);renderShoppingPanels();} }
function addOrderItem(shop) {
  const name = prompt("Nom de l'article ?"); if(!name) return;
  const qty  = prompt('Quantité ?', '1 unité'); if(!qty) return;
  const cat  = Object.keys(shoppingData[shop])[0] || 'Divers';
  if(!shoppingData[shop][cat]) shoppingData[shop][cat]=[];
  shoppingData[shop][cat].push({ name, qty }); renderShoppingPanels();
}
function launchOrder(shop) {
  const name = shop==='koro'?'Koro':'Super U';
  const url  = shop==='koro'?'https://www.koro.com/fr/':'https://www.courses.super-u.com/';
  const n    = Object.values(shoppingData[shop]).flat().length;
  alert(`🤖 Playwright va ouvrir ${name} et ajouter ${n} article(s) au panier.\n\nURL : ${url}`);
}

// ── BATCH ─────────────────────────────────────────────────────
function renderBatch() {
  const done = Object.values(completedSteps).filter(Boolean).length;
  document.getElementById('batch-progress-text').textContent = `${done}/${BATCH_STEPS.length} étapes complétées`;
  document.getElementById('batch-steps').innerHTML = BATCH_STEPS.map((step,i) => {
    const isDone=completedSteps[i]; const isRunning=activeTimers[i];
    return `<div class="batch-step ${isDone?'done':''}" id="step-${i}">
      <div class="step-num" style="${isDone?'background:var(--green-dim);color:var(--green)':''}">${isDone?'✓':i+1}</div>
      <div class="step-info"><div class="step-name">${step.time} — ${step.name}</div><div class="step-tech">Technique : ${step.tech}</div></div>
      <span class="step-duration">${step.duration}</span>
      <button class="timer-btn ${isRunning?'running':''}" onclick="toggleTimer(${i})">${isDone?'✓ Fait':isRunning?'⏸ Pause':'▶ Démarrer'}</button>
      ${!isDone?`<button class="timer-btn" onclick="markDone(${i})" style="color:var(--green)">✓</button>`:''}
    </div>`;
  }).join('');
}
function toggleTimer(i) { activeTimers[i]=!activeTimers[i]; renderBatch(); }
function markDone(i)    { completedSteps[i]=true; activeTimers[i]=false; renderBatch(); }
function resetBatch()   { if(confirm('Réinitialiser toutes les étapes ?')){completedSteps={};activeTimers={};renderBatch();} }

// ── EXPORT GLOBAL (onclick HTML) ──────────────────────────────
Object.assign(window, {
  navigate, prevWeek, nextWeek, generateMenu, pickRecipe, removeMeal,
  renderRecipes, filterRecipes, rateRecipe, addToPlanning, aiDiscovery,
  openProposalModal, selectType, closeModal, closeModalOutside, generateFicheTech,
  openRecipeDetail, saveField, updateIngredient, removeIngredient, addIngredient,
  updateBatchStep, removeBatchStep, addBatchStep, editInline,
  renderOrderSummary, toggleItem, updateOrderQty, removeOrderItem, addOrderItem, launchOrder,
  toggleTimer, markDone, resetBatch,
});

// ── INIT ──────────────────────────────────────────────────────
// Remplace les onclick="navigate(this)" par des event listeners
// pour éviter le conflit avec window.navigate natif de Chrome
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.removeAttribute('onclick');
  btn.addEventListener('click', () => navigate(btn));
});

// Auto-génère un menu à la première visite (plan vide)
if (Object.keys(weekPlan).length === 0) {
  const menu = generateWeekMenu(currentRecipes);
  const ws = getWeekStart(currentWeekOffset);
  DAY_KEYS.forEach((dk, i) => {
    if (menu[dk]) { const d = new Date(ws); d.setDate(ws.getDate() + i); weekPlan[d.toDateString()] = menu[dk]; }
  });
  Storage.savePlan(weekPlan);
}

renderPlanning(); renderRecipes('all'); renderShopping(); renderBatch();
