# Plan d'implémentation : site « IA & éthique » (ÉTS, cours d'éthique de l'ingénieur)

> **Statut (24 sept. 2026)** : étapes 1 à 11 réalisées et testées en local (parcours complet vérifié automatiquement sur mobile 375 px, tablette 820 px et ordinateur 1440 px, sans erreur ni débordement horizontal). Reste l'étape 12 : la mise en ligne (Supabase, GitHub, Vercel), qui demande vos comptes. Voir le README.
>
> **Écarts par rapport au plan ci-dessous :**
> - Next.js **16** : le `middleware.ts` s'appelle désormais `proxy.ts`.
> - i18n faite avec de simples dictionnaires (`messages/*.ts`) au lieu de `next-intl` : moins de dépendances, même résultat.
> - Pas de shadcn/ui ni de recharts : composants et graphiques en Tailwind pur. C'est plus léger, et les couleurs des graphiques sont validées pour le daltonisme.
> - `CONTENT_VERSION` est défini dans `content/index.ts` (versionné avec les questions), pas en variable d'environnement.
> - Sondage : la question « part de l'électricité des data centers » (qui aurait doublonné avec le quiz) a été remplacée par une jauge d'opinion `q_env_impact` (« impact de ton usage de l'IA », de 0 à 100).
> - Quiz : la comparaison « requête chatbot vs recherche Google » (chiffres trop incertains) a été remplacée par « entraînement vs utilisation ». La question sur les déchets électroniques utilise la jauge 0-100 %.
> - Ajout d'une page `/fr/demo` qui présente tous les types de questions avec des textes « Test quiz / Test sondage ».
> - En local, sans Supabase, les réponses vont dans `.data/db.json`.

## 0. Résumé

Site web bilingue (FR/EN), anonyme, sans connexion, en 3 étapes enchaînées en **5 minutes max** :

1. **Sondage « avant »** : perception et usages de l'IA (≈ 1 min)
2. **Quiz pédagogique** : bonne réponse et explication sourcée après **chaque** question (≈ 2 min 30)
3. **Sondage « après »** : une partie des questions du sondage 1 est reposée pour mesurer l'évolution (≈ 1 min)
4. **Écran final** : conseils concrets pour un usage plus responsable de l'IA

Un **dashboard admin** protégé par un mot de passe affiche les stats par question et la comparaison avant/après.

| Choix | Décision |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| BDD | Supabase (Postgres), accès uniquement côté serveur |
| Hébergement | Vercel (déploiement auto depuis GitHub) |
| Langues | FR (par défaut) + EN, via `next-intl` |
| Correction du quiz | Après chaque question, avec explication et source |
| Accès admin | Mot de passe partagé (variable d'environnement) et cookie de session signé |
| Cible | Responsive mobile et ordinateur |
| Dashboard | Graphiques par question + comparaison avant/après |

---

## 1. Stack et dépendances

| Rôle | Librairie |
|---|---|
| UI | Tailwind CSS v4 + shadcn/ui (Radix), pour des composants accessibles |
| Animations | `motion` (Framer Motion), pour les transitions entre questions |
| Curseurs (jauge, estimation, Likert) | `@radix-ui/react-slider`, via shadcn Slider |
| Glisser-déposer (classement) | `@dnd-kit/core` + `@dnd-kit/sortable`, qui gèrent bien le tactile |
| i18n | `next-intl` (routes `/fr/...` et `/en/...`) |
| Validation | `zod`, côté client et serveur |
| BDD | `@supabase/supabase-js` (clé service role, côté serveur uniquement) |
| Session admin | `jose` (JWT signé dans un cookie httpOnly) |
| Graphiques | `recharts` |
| Qualité | ESLint, Prettier, Vitest (logique de scoring) |

---

## 2. Arborescence du projet

```
/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # layout public + sélecteur de langue
│   │   ├── page.tsx                # accueil : intro, consentement, bouton « Commencer »
│   │   ├── parcours/page.tsx       # le parcours complet (1 page, machine à états côté client)
│   │   └── merci/page.tsx          # écran final : conseils
│   ├── admin/
│   │   ├── login/page.tsx          # formulaire de mot de passe
│   │   ├── page.tsx                # dashboard (server component)
│   │   └── layout.tsx
│   └── api/
│       ├── session/route.ts        # POST : crée une session anonyme → { sessionId }
│       ├── answer/route.ts         # POST : enregistre une réponse
│       ├── complete/route.ts       # POST : marque la session comme terminée
│       └── admin/
│           ├── login/route.ts      # POST : vérifie le mot de passe, pose le cookie
│           └── logout/route.ts
├── components/
│   ├── flow/                       # Stepper, barre de progression, écrans de transition
│   ├── questions/                  # un composant par type de question (voir §4)
│   ├── feedback/                   # carte « Bonne réponse / Explication / Source »
│   └── admin/                      # graphiques, KPIs, comparaison avant/après
├── content/
│   ├── survey-pre.ts               # questions du sondage 1
│   ├── quiz.ts                     # questions du quiz
│   ├── survey-post.ts              # questions du sondage 2 (réutilise des IDs du sondage 1)
│   └── tips.ts                     # conseils de l'écran final
├── lib/
│   ├── types.ts                    # types des questions (union discriminée)
│   ├── scoring.ts                  # calcul de la justesse par type
│   ├── supabase-server.ts
│   ├── admin-auth.ts               # signature et vérification du cookie
│   └── stats.ts                    # agrégations pour le dashboard
├── messages/fr.json, en.json       # textes d'interface (hors questions)
├── supabase/migrations/001_init.sql
├── middleware.ts                   # next-intl + protection de /admin
└── PLAN.md
```

**Principe clé : les questions sont dans le code (`content/*.ts`), pas en BDD.** Pour modifier les questions, on édite un fichier puis on fait un `git push`, et Vercel redéploie. Les modifications sont versionnées et relues par l'équipe, et on n'a pas besoin d'un back-office d'édition. La BDD ne stocke que les **réponses**, référencées par un `question_id` stable.

---

## 3. Modèle de données (Supabase)

`supabase/migrations/001_init.sql`

```sql
create table sessions (
  id            uuid primary key default gen_random_uuid(),
  locale        text not null check (locale in ('fr','en')),
  device        text check (device in ('mobile','tablet','desktop')),
  content_version text not null,          -- ex. "2026-10-01", pour savoir quelle version des questions a été vue
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  quiz_score    real                       -- score final 0..1, calculé côté serveur
);

create table answers (
  id           bigint generated always as identity primary key,
  session_id   uuid not null references sessions(id) on delete cascade,
  phase        text not null check (phase in ('pre','quiz','post')),
  question_id  text not null,              -- ex. "q_env_water", identique entre pre et post
  value        jsonb not null,             -- réponse brute (format selon le type)
  correctness  real,                       -- 0..1 pour le quiz, null pour les sondages
  time_ms      integer,                    -- temps passé sur la question
  created_at   timestamptz not null default now(),
  unique (session_id, phase, question_id)  -- une seule réponse par question, upsert si retour arrière
);

create index on answers (question_id, phase);

alter table sessions enable row level security;
alter table answers  enable row level security;
-- Aucune policy : l'accès public est bloqué. Seules les routes API (clé service role) lisent et écrivent.
```

**Format de `value` selon le type :**

| Type | `value` |
|---|---|
| `single` / `true_false` / `ab` | `{ "choice": "b" }` |
| `multi` | `{ "choices": ["a","c"] }` |
| `likert` | `{ "level": 4 }` (1..5) |
| `gauge` | `{ "value": 63 }` (0..100) |
| `estimate` | `{ "value": 2500 }` (valeur réelle, dans l'unité de la question) |
| `ranking` | `{ "order": ["video","image","search","email"] }` |

**Anonymat (Loi 25 du Québec) :** on ne stocke ni IP, ni email, ni nom, et aucun cookie de suivi. Le `sessionId` vit seulement en `sessionStorage` pendant le parcours. On détecte le type d'appareil (`device`) à partir du user-agent, puis on jette celui-ci.

---

## 4. Types de questions (composants)

Un fichier `lib/types.ts` définit une **union discriminée** :

```ts
type L = { fr: string; en: string };          // texte bilingue

type Base = {
  id: string;                                  // stable, ex. "q_env_water"
  prompt: L;
  help?: L;                                    // petite précision sous la question
};

type QuizExtras = {
  explanation: L;                              // 1-2 phrases montrées après la réponse
  source?: { label: string; url: string };
};

type Question =
  | Base & { type: 'single';     options: { id: string; label: L }[]; correct?: string }
  | Base & { type: 'multi';      options: { id: string; label: L }[]; correct?: string[] }
  | Base & { type: 'true_false'; correct?: boolean }
  | Base & { type: 'ab';         a: { label: L; icon?: string }; b: { label: L; icon?: string }; correct?: 'a' | 'b' }
  | Base & { type: 'likert';     minLabel: L; maxLabel: L }                     // sondages uniquement
  | Base & { type: 'gauge';      minLabel?: L; maxLabel?: L; unit?: string; correct?: number; tolerance?: number }
  | Base & { type: 'estimate';   min: number; max: number; unit: L; logScale: true; correct?: number; comparison?: L }
  | Base & { type: 'ranking';    items: { id: string; label: L; icon?: string }[]; correct?: string[] };

type QuizQuestion = Question & QuizExtras;
```

Détail de l'UX de chaque composant :

| Type | UX | Temps visé |
|---|---|---|
| `single` | 2 à 4 grosses cartes cliquables, réponse enregistrée au clic sans bouton « Valider » | ~8 s |
| `multi` | Cartes à cocher + bouton « Valider » | ~12 s |
| `true_false` | 2 gros boutons Vrai / Faux | ~5 s |
| `ab` | 2 cartes côte à côte (empilées sur mobile) avec icône, « Lequel consomme le plus ? » | ~6 s |
| `likert` | 5 pastilles horizontales avec libellés aux extrémités, avance automatique au clic | ~5 s |
| `gauge` | Curseur 0-100, valeur affichée en gros au-dessus du pouce, bouton « Valider ». Après validation, un 2e marqueur animé glisse jusqu'à la bonne valeur | ~12 s |
| `estimate` | Curseur **logarithmique** (ex. 1 mL → 10 000 L) avec valeur formatée (« ≈ 500 mL »). Après validation, on montre la bonne valeur et une comparaison parlante (« = 1 bouteille d'eau ») | ~15 s |
| `ranking` | Liste réordonnable par glisser-déposer, avec flèches ↑↓ en alternative pour l'accessibilité et le tactile. Après validation, les items mal placés sont surlignés et animés vers leur place | ~20 s |

**Carte de feedback (quiz)** : après la réponse, une carte glisse depuis le bas avec ✅/❌ (ou « Pas loin ! » pour les jauges), la bonne réponse, l'explication, un lien vers la source et un bouton « Suivant ». Il n'y a pas d'avance automatique, pour laisser le temps de lire.

**Scoring (`lib/scoring.ts`, testé avec Vitest), valeur de 0 à 1 :**
- `single` / `true_false` / `ab` : 1 ou 0
- `multi` : score de Jaccard entre la réponse et la bonne réponse
- `gauge` : `max(0, 1 - |réponse - correct| / tolerance)`, avec `tolerance` = 25 par défaut
- `estimate` : basé sur l'écart en ordres de grandeur, `max(0, 1 - |log10(r) - log10(c)|)` (le bon ordre de grandeur donne ≈ 1)
- `ranking` : tau de Kendall normalisé sur 0..1

---

## 5. Parcours utilisateur (budget ≤ 5 min)

```
Accueil (10 s)
  « 5 min · anonyme · 3 étapes » + case de consentement + [Commencer]
      ↓
Étape 1/3 : Sondage avant   ~6 questions   ≈ 60 s
      ↓  écran de transition (« Maintenant, testons tes connaissances ! »)
Étape 2/3 : Quiz            ~8 questions   ≈ 150 s
      ↓  écran de transition (score : « 6/8 »)
Étape 3/3 : Sondage après   ~4 questions   ≈ 45 s   (reprises du sondage 1)
      ↓
Fin : 3 à 5 conseils concrets + sources
```

**Règles d'ergonomie :**
- Une question par écran, texte court (≤ 20 mots), grosses zones de clic (≥ 48 px).
- Barre de progression en 3 segments (Sondage / Quiz / Sondage) en haut, toujours visible.
- Bouton « Retour » discret : on peut corriger une réponse du sondage, mais **pas** du quiz une fois la correction vue.
- Clavier : touches 1 à 5 pour les choix, Entrée pour valider (pratique sur ordinateur).
- Chaque réponse est envoyée à `/api/answer` en tâche de fond, sans bloquer l'UI, avec une file de réessai en cas d'erreur réseau. Les abandons en cours de route sont donc conservés, ce qui permet de mesurer le taux d'abandon.
- `prefers-reduced-motion` est respecté, avec un contraste AA.
- Le sondage « après » peut être formulé à l'identique, mais on ajoute en sous-titre « Ton avis a-t-il changé ? », sans montrer l'ancienne réponse pour ne pas biaiser.

**Machine à états côté client** (`useReducer` dans `parcours/page.tsx`) :
`intro → pre[i] → transition1 → quiz[i] (answer → feedback) → transition2 → post[i] → done`.
L'état est sauvegardé en `sessionStorage`, pour que recharger la page ne fasse pas tout perdre.

---

## 6. Contenu : brouillon de questions

Le site sera livré avec **ces questions en brouillon**, marquées `// TODO: valider`, à côté de quelques questions « Test sondage » / « Test quiz » pour tester chaque type. ⚠️ **Tous les chiffres sont à vérifier** par l'équipe avant la mise en ligne. Ce sont des ordres de grandeur tirés de sources connues, et les estimations évoluent vite.

### 6.1 Sondage avant (6 questions)

| ID | Type | Question | Repris après ? |
|---|---|---|---|
| `p_usage_freq` | single | À quelle fréquence utilises-tu des outils d'IA générative ? (Jamais / Mensuel / Hebdo / Quotidien / Plusieurs fois par jour) | non |
| `p_usage_type` | multi | Pour quoi principalement ? (Études, Code, Rédaction, Images, Loisir, Travail) | non |
| `q_env_concern` | likert | « L'impact environnemental de l'IA me préoccupe. » | **oui** |
| `q_env_estimate` | gauge | Selon toi, quelle part de l'électricité mondiale consomment les centres de données ? (0 à 10 %) | **oui** |
| `q_social_fair` | likert | « Les personnes qui entraînent et modèrent les IA sont traitées équitablement. » | **oui** |
| `q_change_habit` | likert | « Je serais prêt·e à changer ma façon d'utiliser l'IA pour réduire son impact. » | **oui** |

### 6.2 Quiz (8 questions, un type différent à chaque fois pour garder le rythme)

| ID | Type | Question | Réponse (à vérifier) | Source à citer |
|---|---|---|---|---|
| `k_datacenter_share` | gauge | Part de l'électricité mondiale consommée par les data centers en 2024 ? | ≈ 1,5 % (≈ 415 TWh), qui devrait à peu près doubler d'ici 2030 | AIE (IEA), *Energy and AI*, 2025 |
| `k_prompt_vs_search` | ab | Qu'est-ce qui consomme le plus : une requête à un chatbot IA ou une recherche Google classique ? | Chatbot (l'écart dépend beaucoup du modèle et de la longueur ; les estimations récentes sont proches pour une requête courte) | Epoch AI 2025 ; Google 2025 (Gemini) |
| `k_water` | estimate | Combien d'eau un grand modèle peut-il consommer (refroidissement + électricité) pour une conversation de ~20-50 réponses ? | ≈ 500 mL (estimation 2023) | Li et al., *Making AI Less Thirsty*, 2023 |
| `k_training` | single | L'entraînement de GPT-3 a consommé environ autant d'électricité que… (1 maison pendant 1 an / ~120 maisons pendant 1 an / une ville entière pendant 1 an) | ≈ 1 300 MWh, soit ~120 foyers nord-américains pendant un an | Patterson et al., 2021 |
| `k_ranking` | ranking | Classe du plus au moins énergivore : générer une vidéo IA, générer une image IA, une requête texte à un chatbot, envoyer un courriel | Vidéo > image > texte > courriel | Luccioni et al., *Power Hungry Processing*, 2024 |
| `k_labor` | true_false | « Des travailleurs au Kenya ont été payés moins de 2 $ US/h pour filtrer des contenus toxiques afin d'entraîner ChatGPT. » | Vrai | TIME, janvier 2023 |
| `k_quebec` | true_false | « Un data center au Québec émet autant de CO₂ qu'un data center alimenté au charbon. » | Faux : l'électricité au Québec est à ~99 % renouvelable (hydro). Mais l'eau, le terrain et la concurrence pour l'électricité restent des enjeux | Hydro-Québec |
| `k_ewaste` | single | Quel est le principal impact du matériel de l'IA (puces GPU) au-delà de l'électricité ? (Extraction de métaux et déchets électroniques / Bruit / Aucun) | Extraction de métaux et e-déchets | UNEP / Global E-waste Monitor 2024 |

### 6.3 Sondage après (4 questions)
`q_env_concern`, `q_env_estimate`, `q_social_fair` et `q_change_habit` sont reprises **avec le même ID**, ce qui permet la comparaison appariée par session.

### 6.4 Conseils de l'écran final (brouillon)
1. Choisir le bon outil : une recherche classique ou une calculatrice suffisent souvent.
2. Formuler des prompts précis pour éviter de relancer 5 fois la même demande.
3. Éviter la génération d'images ou de vidéos « pour le fun » en boucle.
4. Préférer des modèles plus petits ou locaux quand c'est possible.
5. S'informer sur les conditions de travail derrière l'IA et sur les politiques des entreprises.

(Chaque conseil a une icône, 1 phrase et un lien vers une source.)

---

## 7. API (Route Handlers)

| Route | Entrée (validée par zod) | Action |
|---|---|---|
| `POST /api/session` | `{ locale }` | Crée une session et renvoie `{ sessionId }`. Le `device` est déduit du user-agent |
| `POST /api/answer` | `{ sessionId, phase, questionId, value, timeMs }` | Vérifie que `questionId` existe dans le contenu de cette `phase` et que `value` respecte le schéma du type. Pour le quiz, **recalcule `correctness` côté serveur**. Fait un upsert et renvoie `{ correctness, correct }` pour le quiz |
| `POST /api/complete` | `{ sessionId }` | Remplit `completed_at` et calcule `quiz_score` = moyenne des `correctness` |
| `POST /api/admin/login` | `{ password }` | Compare avec `ADMIN_PASSWORD` en temps constant, puis pose le cookie `admin_session` (JWT HS256, 8 h, httpOnly, secure, sameSite=lax) |

**Anti-abus (léger, adapté à un projet de cours) :** un rafraîchissement de page reprend la même session grâce au `sessionStorage` ; les réponses sont rejetées si la session a plus de 2 h ; un champ honeypot est ajouté dans le formulaire de départ. Pas de captcha, pour ne pas nuire à l'UX.

---

## 8. Dashboard admin (`/admin`)

Protégé par `middleware.ts` : sans cookie valide, redirection vers `/admin/login`. Les données sont lues côté serveur avec la clé service role et agrégées dans `lib/stats.ts` (requêtes SQL, ou une vue ou fonction Postgres si les volumes grossissent).

**Section 1 : KPIs (tuiles)**
Sessions démarrées · Sessions terminées · Taux de complétion · Durée médiane · Score moyen au quiz · Répartition FR/EN · Répartition mobile/ordinateur.

**Section 2 : ⭐ Comparaison avant/après** (le résultat central du rapport)
- Uniquement sur les sessions **terminées**, avec un appariement pre/post par `session_id`.
- Pour chaque question reprise :
  - « dumbbell chart » : moyenne avant ● → moyenne après ●, avec le delta affiché (ex. +0,8 pt sur 5)
  - pourcentages de répondants qui ont augmenté, n'ont pas changé ou ont diminué (barre empilée)
  - pour `q_env_estimate` : écart à la vraie valeur avant et après (« l'erreur moyenne passe de 4,1 à 0,9 pt »)
- n affiché partout.

**Section 3 : Détail par question**
Un sélecteur de phase (Avant / Quiz / Après), puis une carte par question :
- `single` / `multi` / `true_false` / `ab` : barres horizontales en %, la bonne réponse surlignée pour le quiz
- `likert` : barre empilée divergente sur 5 niveaux
- `gauge` / `estimate` : histogramme (bins de 10, ou échelle log) avec une ligne verticale pour la vraie valeur
- `ranking` : position moyenne de chaque item et % de classements parfaits
- Quiz : taux de réussite et temps médian, pour repérer les questions trop dures ou trop longues

**Section 4 : Entonnoir d'abandon**
Nombre de sessions encore présentes à chaque question, pour voir où les gens décrochent.

Pas d'export CSV pour l'instant, car il n'a pas été demandé. Si besoin, les tables sont exportables en un clic depuis l'interface Supabase.

---

## 9. i18n

- `next-intl` avec les locales `['fr','en']`, `fr` par défaut. La détection se fait par `Accept-Language` à la première visite, puis via un bouton FR | EN dans l'en-tête.
- Textes d'interface dans `messages/*.json`. Questions dans `content/*.ts`, où chaque texte est un objet `{ fr, en }`.
- Un test Vitest vérifie qu'aucune question n'a de traduction manquante ou vide.
- Le dashboard admin est en français seulement.

---

## 10. Design

- Ton sobre et « scientifique accessible ». Palette : vert/sauge (environnement), bleu nuit (tech), accent orange pour les feedbacks. Mode sombre automatique.
- Typographie : Inter ou Geist.
- Micro-animations : transition en glissé entre questions, marqueur de la bonne réponse qui glisse sur la jauge, petit confetti sobre sur une bonne réponse (désactivé avec `reduced-motion`).
- Mobile d'abord pour la mise en page, en vérifiant les largeurs 360 px, 768 px et 1280 px.

---

## 11. Déploiement (GitHub + Vercel + Supabase)

1. `git init`, création du repo GitHub (privé ou public, au choix de l'équipe), puis premier push.
2. Créer un projet Supabase (région **ca-central-1**, Montréal) et exécuter `supabase/migrations/001_init.sql`.
3. Importer le repo dans Vercel et ajouter les variables d'environnement :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ jamais préfixée `NEXT_PUBLIC_`)
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET` (32+ caractères aléatoires)
   - `CONTENT_VERSION`
4. Chaque push sur `main` déploie en production, et chaque branche ou PR a sa preview URL, ce qui est pratique pour que l'équipe relise les questions.
5. Optionnel : utiliser un projet Supabase séparé pour les previews afin de ne pas polluer les stats. Sinon, **vider les tables avant le lancement officiel**.
6. Générer un QR code vers l'URL de production pour les affiches.

---

## 12. Étapes de réalisation (ordre de développement)

| # | Étape | Livrable vérifiable |
|---|---|---|
| 1 | Init Next.js + Tailwind + shadcn + next-intl, repo Git | Page d'accueil FR/EN en local |
| 2 | Types de questions + contenu brouillon (§6) + tests de complétude i18n | `npm test` passe |
| 3 | Composants des 8 types de questions + page de démo `/dev/questions` | Chaque type utilisable sur mobile et ordinateur |
| 4 | Machine à états du parcours + barre de progression + transitions + carte de feedback | Parcours complet jouable, sans BDD |
| 5 | `lib/scoring.ts` + tests unitaires | Tests de scoring qui passent |
| 6 | Supabase : migration + routes API + envoi en tâche de fond avec réessai | Réponses visibles dans Supabase |
| 7 | Écran de fin (conseils) | — |
| 8 | Auth admin (login, middleware, cookie) | `/admin` inaccessible sans mot de passe |
| 9 | Dashboard : KPIs, comparaison avant/après, détail par question, entonnoir | Graphiques remplis avec des données de test |
| 10 | Script de seed (≈ 200 sessions fictives) pour tester le dashboard | — |
| 11 | Passe responsive, accessibilité, `reduced-motion`, chronométrage réel ≤ 5 min | Test sur téléphone |
| 12 | Déploiement Vercel + variables d'environnement + purge des données de test + QR code | URL de production en ligne |

---

## 13. Points à trancher par l'équipe (non bloquants pour démarrer)

- **Éthique de la recherche** : même pour un projet de cours, une collecte de données auprès de personnes peut relever du Comité d'éthique de la recherche (CÉR) de l'ÉTS. À vérifier avec le professeur. Le texte de consentement de l'accueil est prévu pour ça.
- Validation des chiffres du quiz et choix final des questions.
- Nom du site et nom de domaine (le sous-domaine `*.vercel.app` gratuit suffit).
