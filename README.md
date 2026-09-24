# L'IA, ce qu'on ne voit pas

Site du projet d'éthique de l'ingénieur (ÉTS Montréal) : **sondage → quiz → sondage**, en 5 minutes, anonyme, en français et en anglais. Il est accompagné d'un dashboard admin qui mesure l'évolution des réponses entre le premier et le second sondage.

Stack : Next.js 16 (App Router) · Tailwind CSS 4 · Supabase (Postgres) · Vercel.

## Démarrer en local

```bash
npm install
npm run dev            # http://localhost:3000
```

Sans configuration, les réponses sont stockées dans `.data/db.json` et le mot de passe admin est `admin`.

| URL | Rôle |
|---|---|
| `/fr` ou `/en` | Accueil + consentement |
| `/fr/parcours` | Le parcours sondage → quiz → sondage |
| `/fr/merci` | Écran final (score + conseils) |
| `/fr/demo` | Démo de tous les types de questions (rien n'est enregistré) |
| `/admin` | Dashboard (mot de passe) |

Commandes utiles :

```bash
npm test               # tests (scoring, traductions complètes, ids uniques…)
npm run seed           # ajoute 200 sessions fictives pour tester le dashboard
npm run db:reset -- --yes   # ⚠️ efface TOUTES les réponses (à faire avant le lancement)
npm run lint && npm run typecheck
```

## Modifier les questions

Tout le contenu est dans [`content/`](content/). Chaque texte est un objet `{ fr, en }`.

- [`content/survey-pre.ts`](content/survey-pre.ts) : sondage 1. Les questions de `REPEATED` sont reposées au sondage 2.
- [`content/quiz.ts`](content/quiz.ts) : quiz, avec la bonne réponse, l'explication et la source.
- [`content/survey-post.ts`](content/survey-post.ts) : sondage 2.
- [`content/tips.ts`](content/tips.ts) : conseils de l'écran final.
- [`messages/fr.ts`](messages/fr.ts), [`messages/en.ts`](messages/en.ts) : textes de l'interface.

Types de questions disponibles (voir [`lib/types.ts`](lib/types.ts) et la page `/fr/demo`) :
`single` (QCM), `multi` (choix multiples), `true_false`, `ab` (comparaison A ou B), `likert` (accord 1-5), `gauge` (jauge 0-100 ou autre plage), `estimate` (estimation sur échelle logarithmique), `ranking` (classement par glisser-déposer).

⚠️ **Une fois le site lancé, ne changez plus les `id` des questions** : les statistiques sont rattachées à ces identifiants. Si vous modifiez le contenu après le lancement, changez aussi `CONTENT_VERSION` dans [`content/index.ts`](content/index.ts).

`npm test` vérifie qu'aucune traduction ne manque et que chaque question du quiz a une bonne réponse.

## Mise en ligne

### 1. Supabase
1. Créer un projet sur [supabase.com](https://supabase.com), dans la région **Canada (Central)**.
2. Dans *SQL Editor*, exécuter [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).
3. Dans *Project Settings → API*, récupérer l'**URL** et la clé **service_role**.

### 2. GitHub
```bash
gh auth login
gh repo create ia-ethique-ets --private --source=. --push
```

### 3. Vercel
1. Sur [vercel.com](https://vercel.com) : *Add New → Project*, puis importer le repo GitHub.
2. Ajouter les variables d'environnement (voir [`.env.example`](.env.example)) : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
3. Déployer. Chaque `git push` sur `main` redéploie automatiquement, et chaque branche a sa propre URL de prévisualisation.

### 4. Avant le lancement
- Faire valider les questions et **vérifier tous les chiffres du quiz**.
- Vider les données de test : `npm run db:reset -- --yes` (avec `.env.local` pointant sur Supabase), ou exécuter `truncate sessions cascade;` dans le SQL Editor de Supabase.
- Générer un QR code vers l'URL de production pour les affiches.

## Anonymat et sécurité
- Aucune donnée personnelle n'est stockée : pas d'IP, pas de compte, pas de cookie de suivi. Le user-agent sert seulement à déduire le type d'appareil (mobile/tablette/ordinateur) et n'est pas conservé.
- L'état du parcours vit dans le `sessionStorage` de l'onglet.
- La base est inaccessible depuis le navigateur (RLS activé sans aucune policy). Seules les routes API serveur y accèdent.
- Chaque réponse est validée côté serveur (question existante, format correct), et le score du quiz est recalculé côté serveur.
- Le dashboard est protégé par un mot de passe et un cookie de session signé (8 h).

## Structure

```
app/[lang]/        pages publiques (accueil, parcours, merci, demo)
app/admin/         dashboard + connexion
app/api/           session, answer, complete, admin/login, admin/logout
components/        questions/ (un composant par type), flow/ (parcours), admin/
content/           questions et conseils (à éditer)
lib/               types, scoring, stats, base de données, auth admin
messages/          textes d'interface FR/EN
proxy.ts           redirection de langue + protection de /admin
scripts/           seed et reset de la base
```
