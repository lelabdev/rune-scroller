# Guide de Test Local - Rune Scroller

## Méthode 1 : pnpm link (Recommandée)

### Dans rune-scroller (bibliothèque)
```bash
# 1. Build la lib
pnpm build

# 2. Créer le lien global
pnpm link --global
```

### Dans votre projet test
```bash
# 3. Lier la bibliothèque
pnpm link --global rune-scroller

# 4. Tester l'import
```

**Exemple de test :**
```svelte
<script>
  // Test API Action
  import runeScroller from 'rune-scroller';

  // Test API Component
  import { RuneScroller } from 'rune-scroller';

  // Test CSS
  import 'rune-scroller/animations.css';
</script>

<!-- Test Action API -->
<div use:runeScroller={{ animation: 'fade-in-up', duration: 1000 }}>
  Action API works! ✅
</div>

<!-- Test Component API -->
<RuneScroller animation="zoom-in" duration={1200}>
  Component API works! ✅
</RuneScroller>
```

**Pour défaire le lien :**
```bash
# Dans le projet test
pnpm unlink rune-scroller

# Dans rune-scroller
pnpm unlink --global
```

---

## Méthode 2 : Dépendance fichier local (Plus simple)

### Dans votre projet test

**Modifier package.json :**
```json
{
  "dependencies": {
    "rune-scroller": "file:../rune-scroller"
  }
}
```

```bash
# Installer depuis le chemin local
pnpm install

# Après chaque modification de la lib
cd ../rune-scroller
pnpm build
cd ../votre-projet
pnpm install
```

**Avantages :**
- ✅ Pas de lien global à gérer
- ✅ Fonctionne toujours
- ✅ Simple à comprendre

**Inconvénients :**
- ❌ Nécessite `pnpm install` après chaque rebuild

---

## Méthode 3 : npm pack (Test final avant publish)

### Dans rune-scroller
```bash
# 1. Build la lib
pnpm build

# 2. Créer un tarball (.tgz)
npm pack
# Crée : rune-scroller-0.1.9.tgz
```

### Dans votre projet test
```bash
# 3. Installer depuis le tarball
pnpm add ../rune-scroller/rune-scroller-0.1.9.tgz
```

**Avantages :**
- ✅ Simule exactement ce qui sera publié sur npm
- ✅ Teste que tous les fichiers nécessaires sont inclus
- ✅ Vérifie les exports et le package.json

**Inconvénients :**
- ❌ Nécessite recréer le .tgz après chaque modification

---

## Méthode 4 : Créer un projet test minimal

**Créer un nouveau projet SvelteKit :**
```bash
# À côté de rune-scroller
npm create svelte@latest test-rune-scroller
cd test-rune-scroller
pnpm install
```

**Dans test-rune-scroller/package.json :**
```json
{
  "dependencies": {
    "rune-scroller": "file:../rune-scroller"
  }
}
```

**Créer test-rune-scroller/src/routes/+page.svelte :**
```svelte
<script>
  import runeScroller from 'rune-scroller';
  import { RuneScroller } from 'rune-scroller';
  import 'rune-scroller/animations.css';
</script>

<main style="height: 200vh; padding: 2rem;">
  <h1>Test Rune Scroller Local</h1>

  <div style="margin-top: 100vh;">
    <!-- Test Action API -->
    <div use:runeScroller={{ animation: 'fade-in-up', duration: 1000 }}>
      <h2>✅ Action API</h2>
      <p>Si vous voyez ceci animé, l'API action fonctionne!</p>
    </div>

    <!-- Test Component API -->
    <RuneScroller animation="zoom-in" duration={1200}>
      <div style="background: lightblue; padding: 2rem; margin-top: 2rem;">
        <h2>✅ Component API</h2>
        <p>Si vous voyez ceci animé, l'API component fonctionne!</p>
      </div>
    </RuneScroller>
  </div>
</main>
```

**Lancer le test :**
```bash
pnpm dev
```

Scrollez vers le bas pour voir les animations!

---

## Checklist de tests

Avant de publier sur npm, vérifier :

### ✅ Imports
- [ ] `import runeScroller from 'rune-scroller'` fonctionne
- [ ] `import { RuneScroller } from 'rune-scroller'` fonctionne
- [ ] `import { animate } from 'rune-scroller'` fonctionne
- [ ] `import 'rune-scroller/animations.css'` fonctionne
- [ ] Types TypeScript disponibles et corrects

### ✅ API Action (use:runeScroller)
- [ ] Animation basique fonctionne
- [ ] Option `duration` fonctionne
- [ ] Option `repeat` fonctionne
- [ ] Option `debug` affiche le sentinel

### ✅ API Component (<RuneScroller>)
- [ ] Component s'affiche correctement
- [ ] Props `animation` fonctionne
- [ ] Props `duration` fonctionne
- [ ] Props `repeat` fonctionne
- [ ] Props `threshold`, `offset` fonctionnent

### ✅ Animations
- [ ] Toutes les 14 animations fonctionnent
- [ ] CSS appliqué correctement
- [ ] GPU acceleration active (vérifier DevTools)

### ✅ Build & Package
- [ ] `pnpm build` sans erreurs
- [ ] `pnpm check` sans erreurs
- [ ] `pnpm test` tous les tests passent
- [ ] Taille du bundle acceptable (~2KB)

---

## Commandes rapides

**Workflow de dev rapide :**
```bash
# Terminal 1 - Watch mode dans rune-scroller
cd rune-scroller
pnpm build && pnpm link --global

# Terminal 2 - Projet test
cd test-rune-scroller
pnpm link --global rune-scroller
pnpm dev

# Après modifications dans rune-scroller
cd rune-scroller
pnpm build
# Le projet test voit les changements automatiquement
```

---

## Résolution de problèmes

**Si les changements ne sont pas pris en compte :**
```bash
# Clear du cache Vite
rm -rf .svelte-kit node_modules/.vite
pnpm install
```

**Si l'import échoue :**
```bash
# Vérifier les exports dans dist/
cat dist/index.js
cat dist/index.d.ts
```

**Si TypeScript se plaint :**
```bash
# Regénérer les types
cd rune-scroller
pnpm check
pnpm build
```
