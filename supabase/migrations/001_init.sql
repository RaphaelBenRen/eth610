-- Schéma de la base (à exécuter une fois dans Supabase > SQL Editor).

create table if not exists sessions (
  id              uuid primary key default gen_random_uuid(),
  locale          text not null check (locale in ('fr','en')),
  device          text check (device in ('mobile','tablet','desktop')),
  content_version text not null,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  quiz_score      real
);

create table if not exists answers (
  id           bigint generated always as identity primary key,
  session_id   uuid not null references sessions(id) on delete cascade,
  phase        text not null check (phase in ('pre','quiz','post')),
  question_id  text not null,
  value        jsonb not null,
  correctness  real,
  time_ms      integer,
  created_at   timestamptz not null default now(),
  unique (session_id, phase, question_id)
);

create index if not exists answers_question_idx on answers (question_id, phase);

-- RLS activé sans aucune policy : l'accès public (clé anon) est entièrement bloqué.
-- Seules les routes API du site (clé service_role, côté serveur) lisent et écrivent.
alter table sessions enable row level security;
alter table answers  enable row level security;
