# PROJECT.md — Fichier d'Initialisation Projet (Dev Solo + IA)

> Ce fichier est la source de vérité unique du projet.
> Toute IA intervenant sur le code DOIT le lire en premier.
> Toute décision structurante DOIT y être tracée ou référencée.

---

## 0. MÉTA

- **Projet** : BATCH
- **Description** : Système complet de batch cooking familial (planification menus, courses, organisation lundi)
- **Auteur** : Nico
- **Créé le** : 2026-02-27
- **Stack** : HTML / CSS / JavaScript (SPA) + Claude API (Anthropic) + Playwright (Koro + Super U)
- **Repo** : [À définir]
- **Déploiement** : Local (navigateur)
- **Statut** : Exploration
- **Environnement** : Antigravity IDE + Claude Code CLI

### 0.1 Tandem IA (à réévaluer à chaque nouveau projet)

> À l'initialisation de chaque projet, évaluer les modèles disponibles
> et choisir le meilleur tandem du moment. Documenter le choix ici.

| Rôle | Modèle actuel | Pourquoi ce choix | Date du choix |
|------|--------------|-------------------|---------------|
| **Architecte** (plan, contrats, review, refactor) | Claude Sonnet 4.6 | Meilleur raisonnement archi, SWE-bench élevé | 2026-02-28 |
| **Exécuteur** (implémentation, UI, tâches répétitives) | Kimi K2.5 | Bon rapport qualité/coût, performant en implémentation dirigée | 2026-02-28 |

**Règles du tandem :**
- Le brainstorm et la planification passent par Antigravity (Gemini ou modèle configuré)
- Le plan Antigravity n'est jamais exécuté directement — toujours validé par l'humain avant passage à l'Architecte
- L'Architecte écrit les contrats (types, interfaces, tests) — il ne code PAS l'implémentation
- L'Exécuteur implémente pour faire passer les tests — il ne modifie JAMAIS les tests
- En cas de doute sur un choix d'archi, c'est toujours l'Architecte qui tranche
- **Réévaluation** : à chaque nouveau projet, ou si un modèle significativement meilleur sort en cours de route, mettre à jour ce tableau et consigner le changement dans un ADR

---

## 1. DOMAINE MÉTIER (Le "Pourquoi")

### 1.1 Glossaire métier
> L'IA DOIT utiliser ces termes exactement, jamais de synonymes.

| Terme | Définition |
|-------|-----------|
| Batch | Session de cuisine collective préparée le lundi pour toute la semaine |
| Fiche technique | Recette normée avec grammages par portion et étapes batch |
| Convive | Membre de la famille participant aux repas (Nico, Flo, Sacha, Victor) |
| Portion adulte | Grammage de référence 100% (base de calcul) |
| Portion enfant | Grammage calculé en % de la portion adulte selon l'âge |
| Plat du soir | Le seul plat servi au dîner (pas de menu complet) |
| Étape batch | Tâche réalisable le lundi et conservable jusqu'au jour de consommation |
| Finition jour J | Préparation rapide à faire le soir de consommation |

### 1.2 Règles métier invariantes
> Ces règles ne changent JAMAIS. L'IA ne doit jamais les contourner.

1. Maximum 3 plats avec viande par semaine 
2. Majorité des plats à base de légumes/végétal (pas de féculents dominants)
3. Recettes simples uniquement (accessibles à un cuisinier amateur)
4. Recettes adaptées à la saison en cours
5. 1 plat unique le soir — jamais de menu entrée/plat/dessert
6. Les grammages sont toujours calculés depuis la portion adulte de référence
7. Sacha (12 ans) = 80% de la portion adulte — aucune restriction alimentaire
8. Victor (9 ans) = 80% de la portion adulte — aucune restriction alimentaire

### 1.3 Utilisateurs cibles
- **Nico** : utilisateur principal, réalise le batch du lundi
- **Flo** : adulte, co-planificatrice des menus
- **Sacha** : enfant 12 ans, convive
- **Victor** : enfant 9 ans, convive

---

## 2. ARCHITECTURE (Le "Comment")

### 2.1 Structure du projet

```
batch/
├── index.html              # SPA principale, navigation onglets
├── PROJECT.md              # CE fichier (source de vérité)
├── README.md               # Setup et documentation
│
├── css/
│   └── style.css           # Design system complet (dark mode)
│
├── js/
│   ├── app.js              # Orchestrateur, routing, state global
│   │
│   ├── data/
│   │   ├── recipes.js      # Base de données recettes familiales
│   │   └── family.js       # Profils et grammages famille
│   │
│   └── modules/
│       ├── planner.js      # Planification menus (grille semaine)
│       ├── shopping.js     # Liste de courses par catégorie
│       ├── order.js        # Commande en ligne
│       ├── batch.js        # Organisation batch du lundi
│       ├── claude.js       # Intégration Claude API
│       └── settings.js     # Paramètres (clé API, préférences)
│
└── docs/
    └── adr/                # Architecture Decision Records
```

### 2.2 Règles d'import (NON NÉGOCIABLES)

```
data/     → ne dépend de rien d'autre
modules/  → peut importer data/ uniquement
app.js    → orchestre les modules, ne contient pas de logique métier
```

### 2.3 Patterns autorisés / interdits

**AUTORISÉS :**
- Modules ES6 (import/export)
- LocalStorage pour la persistance
- Fetch API pour les appels Claude
- Pattern state centralisé dans app.js

**INTERDITS :**
- Frameworks CSS (pas de Tailwind, Bootstrap)
- Bibliothèques JS tierces non justifiées
- Appels API directs hors du module claude.js
- Logique métier dans index.html

---

## 3. CONVENTIONS DE CODE

### 3.1 Nommage
- Fichiers : `kebab-case.js` (ex: `batch-cooking.js`)
- Fonctions : `camelCase`
- Constantes : `SCREAMING_SNAKE_CASE`
- IDs HTML : `kebab-case` (ex: `recipe-card`, `week-planner`)
- Classes CSS : `kebab-case` (ex: `.recipe-card`, `.btn-primary`)

### 3.2 Commentaires
- OUI aux commentaires "pourquoi" métier
- OUI aux TODO avec contexte : `// TODO(nico): ajouter préférences marques`
- NON aux commentaires évidents

### 3.3 Taille et complexité
- Max **200 lignes** par fichier JS
- Max **30 lignes** par fonction
- Si ça dépasse → on split

---

## 4. STRATÉGIE DE TESTS (TDD)

### 4.1 Pyramide de tests

```
        ╱ E2E ╲              ← Parcours critiques (Playwright)
       ╱────────╲
      ╱ Intégration ╲        ← Modules + interactions (Vitest)
     ╱────────────╲
    ╱   Unitaires    ╲       ← Logique métier pure (Vitest)
   ╱────────────────╲
```

### 4.2 Ce qu'on teste et avec quoi

| Couche | Ce qu'on teste | Outil |
|--------|---------------|-------|
| `js/data/` | Calculs de grammages, multiplicateurs | Vitest (unitaire) |
| Règles métier | Max 3 viandes/sem, sélection saison | Vitest (unitaire) |
| `js/modules/shopping.js` | Agrégation des ingrédients, calcul `×3.45` | Vitest (unitaire) |
| `js/modules/batch.js` | Priorisation des étapes, calcul durées | Vitest (unitaire) |
| Modules E2E | Grille menus, liste de courses, batch | Playwright |

### 4.3 Cycle TDD avec le tandem IA

```
1. USER          → Écrit la User Story (français, langage naturel)
2. ARCHITECTE    → Claude Sonnet 4.6 : définit les types + interfaces
3. ARCHITECTE    → Écrit les tests unitaires (RED — échec attendu)
4. EXÉCUTEUR     → Kimi K2.5 : implémente pour faire passer les tests (GREEN)
5. ARCHITECTE    → Review + refactor (REFACTOR)
6. USER          → Vérifie, valide, merge
```

> 🚨 RèGLE CRITIQUE : L'Exécuteur ne modifie JAMAIS les tests.
> Si un test échoue → il corrige l'implémentation, pas le test.

### 4.4 Cas critiques à couvrir obligatoirement

- [ ] Calcul portion : `grammage × 3.45` donne le bon résultat
- [ ] Maximum 3 plats viande par semaine respecté
- [ ] Génération liste courses : doublons agrégés correctement
- [ ] Recettes hors saison non proposées
- [ ] Batch : étape la plus longue toujours en premier

### 4.5 Outils
- **Vitest** : tests unitaires JS (rapide, configurable)
- **Playwright** : tests E2E **et** automatisation Amazon Fresh (double usage)
- Commande : `npx vitest run` / `npx playwright test`

---

## 5. FONCTIONNALITÉS & BLOCS

### BLOC 1 — Profils Famille
| Membre | Type | Âge | Multiplicateur |
|--------|------|-----|----------------|
| Nico   | Adulte | — | 1.00 (100%) |
| Flo    | Adulte | — | 1.00 (100%) |
| Sacha  | Enfant | 12 ans | 0.80 (80%) |
| Victor | Enfant | 9 ans | 0.8 (80%) |

### BLOC 2 — Fiche Technique Recette
Chaque recette contient :
- Nom + description + saison(s)
- Type : `vegetal` | `viande` | `poisson`
- Temps : préparation + cuisson
- Ingrédients + grammage pour 1 adulte référence + tag magasin (`koro` | `superU`)
- Étapes de préparation avec techniques
- Étapes batch (lundi) vs finition (jour J)
- **Note famille** : 1–5 ⭐ (saisie après dégustation)
- **Origine** : `catalogue` (pré-définie) | `ia` (proposée par Claude)

**Règles de notation :**
| Note | Statut | Comportement Claude |
|------|--------|--------------------|
| ⭐⭐⭐⭐⭐ | **Favori** | Pool favori : revient toutes les 2–3 semaines |
| ⭐⭐⭐⭐ | **Apprécié** | Rotation ocasionnelle |
| ⭐⭐⭐ | **Correct** | Proposé si rien de mieux |
| ⭐⭐ | **Moyen** | Rare, quasiment plus proposé |
| ⭐ | **Éviter** | Exclu des suggestions |

### BLOC 3 — Planification Menus

**Composition de la semaine (7 dîners) :**
```
Menus = Pool Favoris (⭐⭐⭐⭐⭐) + Rotation (⭐⭐⭐⭐) + Découvertes IA (1–2/semaine)
```

- Claude respecte toujours les règles métier (max 3 viandes, végétal dominant, saison)
- Grille Lun→Dim modifiable cellule par cellule
- Les recettes IA proposées peuvent être notées → intègrent le pool si ⭐⭐⭐⭐⭐
- Catalogue de base : 20 recettes pré-définies + recettes IA accumulées au fil du temps

### BLOC 4 — Liste de Courses
```
Quantité = grammage(1 adulte) × (1 + 1 + 0.8 + 0.8)
         = grammage × 3.6
```
Catégories : 🥩 Viandes · 🥦 Légumes · 🧀 Crémerie · 🥫 Épicerie · 🥖 Boulangerie

### BLOC 5 — Commande en Ligne (2 magasins)

**Flux :**
```
Liste générée → Split Koro/SuperU → Proposition panier → Nico ajuste → Validation → Playwright → Paiement
```

| Magasin | Catégories | MDD | Automatisation |
|---------|-----------|-----|----------------|
| **Koro** | Sec : lentilles, riz, pâtes, farines, épices, huiles, conserves, graines | N/A | Playwright (koro.de) |
| **Super U** | Frais : légumes, viandes, crémerie, boülangerie + hors-sec | MDD "U" prioritaire | Playwright (courses.super-u.com) |

**Règle MDD "U" :** si produit marque U existe → on le sélectionne. Sinon → moins chère disponible (P3 : configurable)

**Règle de répartition des ingrédients :**

| Catégorie | Exemples | Magasin |
|-----------|---------|---------|
| Légumineuses sèches | Lentilles, pois chiches, haricots secs | 🟡 Koro |
| Céréales sèches | Riz, pâtes, semoule, boulgour, quinoa | 🟡 Koro |
| Farines & levures | Farine blé, fécule, levure | 🟡 Koro |
| Épices & herbes sèches | Cumin, curcuma, thym, origan... | 🟡 Koro |
| Huiles & vinaigres | Huile d'olive, huile sésame, vinaigre | 🟡 Koro |
| Fruits à coque & graines | Amandes, noix, graines | 🟡 Koro |
| Légumes & fruits frais | Courgettes, carottes, tomates fraîches... | 🔴 Super U |
| Viandes & poissons | Poulet, bœuf, cabillaud, saumon | 🔴 Super U |
| Crémerie | Lait, beurre, crème, fromage, yaourts | 🔴 Super U |
| Œufs | Œufs frais | 🔴 Super U |
| Conserves | Tomates concassées, lait de coco, thon | 🔴 Super U |
| Boulangerie | Pain, pain de mie | 🔴 Super U |

### BLOC 6 — Batch du Lundi
- Planning horaire priorisé (durée longue → démarre en premier)
- Techniques et grammages par étape
- Planning de finition par jour de consommation (Mar→Dim)

---

## 6. SÉCURITÉ

### 5.1 Règles de base
- Clé API Claude stockée en LocalStorage uniquement (jamais dans le code)
- Aucune donnée personnelle envoyée à des tiers (hors Claude API)
- Pas de backend — application 100% locale

---

## 7. DOCUMENTATION VIVANTE

### 6.1 Fichiers obligatoires
- `PROJECT.md` : CE fichier (source de vérité)
- `README.md` : Setup, description, fonctionnalités
- `docs/adr/` : Architecture Decision Records

### 6.2 Format ADR (simple)
```markdown
# ADR-XXX : [Titre de la décision]
- **Date** : YYYY-MM-DD
- **Statut** : Accepté / Remplacé par ADR-YYY
- **Contexte** : Pourquoi cette décision se pose
- **Décision** : Ce qu'on a choisi
- **Alternatives considérées** : Ce qu'on a rejeté et pourquoi
- **Conséquences** : Ce que ça implique
```

---

## 8. RÈGLES POUR L'IA

### 7.1 Comportement général
- Lire PROJECT.md AVANT toute action
- Respecter les règles métier invariantes (section 1.2) — jamais de dérogation
- Proposer, ne pas imposer
- En cas de doute → demander, pas deviner

### 7.2 Limites strictes
- Ne JAMAIS modifier : `PROJECT.md`, les fichiers `.env`
- Ne JAMAIS hardcoder la clé API Claude
- Ne JAMAIS installer une dépendance sans justification
- Ne JAMAIS faire un "quick fix" qui viole l'architecture

### 7.3 Checkpoints humains obligatoires
L'IA s'arrête et demande validation AVANT :
- Tout changement de structure de données (recettes, famille)
- Toute nouvelle dépendance externe
- Tout refactoring touchant plus de 3 fichiers
- Toute décision d'architecture non couverte par ce fichier

---

## 9. ROADMAP & PRIORISATION

| Priorité | Feature | Statut |
|----------|---------|--------|
| P0 | Profils famille + base recettes | À faire |
| P0 | Planification menus (grille) + Claude | À faire |
| P1 | Liste de courses générée | À faire |
| P1 | Batch du lundi (planning + timers) | À faire |
| P2 | Commande en ligne | À faire |
| P3 | Préférences marques produits | Backlog |

---

## ANNEXE : Refactoring cyclique

Tous les **5 features livrées**, faire un checkpoint :
- [ ] Les fichiers respectent-ils les limites de taille ?
- [ ] Y a-t-il des imports qui violent les règles ?
- [ ] Y a-t-il du code dupliqué entre modules ?
- [ ] Les règles métier sont-elles toujours respectées ?
- [ ] Le README est-il à jour ?

> Ce n'est pas une revue formelle. C'est 30 min de bon sens tous les 5 features.
