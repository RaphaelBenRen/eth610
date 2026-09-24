/*
 * Supprime TOUTES les réponses (Supabase si configuré, sinon .data/db.json).
 *   npm run db:reset -- --yes
 * À faire juste avant le lancement officiel pour effacer les données de test.
 */
import { getStore, usingSupabase } from "../lib/db";

async function main() {
  if (!process.argv.includes("--yes")) {
    console.log(`Cette commande efface toutes les réponses (${usingSupabase() ? "Supabase" : ".data/db.json"}).`);
    console.log("Relance avec :  npm run db:reset -- --yes");
    process.exit(1);
  }
  await getStore().reset();
  console.log("🗑️  Toutes les sessions et réponses ont été supprimées.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
