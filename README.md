# 🍳 BATCH — Système de Batch Cooking Familial

> Créé le 27/02/2026 — En cours de définition

---

## 👨‍👩‍👧‍👦 La Famille

| Membre | Rôle | Âge | Multiplicateur portion |
|--------|------|-----|------------------------|
| Nico   | Adulte | — | 100% |
| Flo    | Adulte | — | 100% |
| Sacha  | Enfant | 12 ans | ~80% |
| Victor | Enfant | 9 ans | ~80% |

---

## 🎯 Objectif de l'application

Application web complète de batch cooking familial qui couvre :
1. La définition des profils famille
2. La planification des menus (IA)
3. La génération des listes de courses
4. La commande en ligne
5. L'organisation du batch du lundi

---

## 🧱 Blocs Fonctionnels

### BLOC 1 — Profils Famille
- 4 membres : 2 adultes + 2 enfants (12 et 9 ans)
- Grammages définis par rapport à 1 adulte référence (100%)
- Paramétrable dans les réglages

### BLOC 2 — Fiche Technique Recette
Chaque recette contient :
- Nom + description
- Saison(s) : printemps / été / automne / hiver
- Type : végétal 🥦 / viande 🥩 / poisson 🐟
- Difficulté : simple / moyen
- Temps : préparation + cuisson + batch
- Ingrédients avec grammage pour 1 adulte référence
- Étapes de préparation (avec techniques)
- Étapes batch : ce qui se prépare le lundi vs le jour J

### BLOC 3 — Planification Menus (IA avec Claude)
**Critères de sélection des recettes :**
- Majorité végétal/légumes (pas de féculents dominants)
- Maximum 3 plats avec viande par semaine (viande facile à digérer)
- Recettes simples à mettre en œuvre
- Recettes de saison
- 1 plat unique le soir (pas de menu complet)

**Fonctionnement :**
- Claude génère 7 recettes pour les 7 dîners de la semaine
- Affichage en grille semaine (Lun → Dim)
- Modification manuelle possible cellule par cellule

### BLOC 4 — Liste de Courses
**Calcul des quantités :**
```
Quantité = grammage(1 adulte) × (Nico + Flo + 0.8×Sacha + 0.8×Victor)
         = grammage × 3.6
```
**Agrégation :**
- Cumul si un ingrédient apparaît dans plusieurs recettes
- Tri par catégorie :
  - 🥩 Boucherie / Viandes
  - 🥦 Fruits & Légumes
  - 🧀 Crémerie / Produits laitiers
  - 🥫 Épicerie sèche
  - 🥖 Boulangerie / BOF
  - 🧹 Entretien (si besoin)

### BLOC 5 — Commande en Ligne (2 magasins)

**Logique :**
1. La liste de courses est **automatiquement splitée** en 2 paniers
2. Chaque panier est proposé à Nico qui **ajuste avant validation**
3. Playwright remplit les paniers sur les sites respectifs
4. Nico paie sur chaque site

| Magasin | Catégories | Priorité marque |
|---------|-----------|----------------|
| **Koro** | Produits secs (lentilles, riz, pâtes, farines, épices, huiles, conserves, fruits à coque) | N/A (vrac) |
| **Super U** | Frais (légumes, viandes, crémerie, boulangerie) + reste | MDD "U" en priorité |

**Flux par magasin :**
```
Liste générée → Proposition panier → Nico ajuste → Validation → Playwright remplit → Paiement
```

**À implémenter (P3) :** Si produit MDD "U" absent → moins chère disponible par défaut

### BLOC 6 — Batch du Lundi
**L'application génère :**
1. Planning horaire priorisé (ce qui prend le plus de temps démarre en premier)
2. Étapes avec techniques détaillées et grammages
3. Planning de finition jour par jour (mardi → dimanche)

---

## 🛠️ Stack Technique

- **Frontend** : HTML + CSS + JavaScript (SPA)
- **IA** : Claude API (Anthropic) — clé API à fournir
- **Commande** : Playwright (Koro + Super U)
- **Stockage** : LocalStorage (pas de backend requis)

---

## ❓ Points encore à définir

- [ ] Clé API Claude (à fournir lors du développement)
- [ ] Préférences de marques produits (P3)

---

## 📅 Statut du projet

- [x] Définition des besoins
- [x] Choix techniques (Option A, Amazon Fresh, pas de restriction alimentaire)
- [ ] Validation du plan complet
- [ ] Développement
- [ ] Tests
- [ ] Mise en production
