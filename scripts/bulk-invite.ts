import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket as never },
  }
);

const TEMP_PASSWORD = "LinkedRank2025!";

const emails = [
  "cognitionetmouvement@gmail.com",   // HILARIC Yohan
  "abdrahamane.daouda@gmail.com",     // SADOU Abdrahamane
  "d.pompas@gmail.com",               // POMPAS Daniel
  "b.hilla78@gmail.com",              // Maguerbi Hilla
];

async function main() {
  console.log(`Creating ${emails.length} accounts with temp password: ${TEMP_PASSWORD}\n`);

  for (const email of emails) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: TEMP_PASSWORD,
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes("already been registered") || error.message.includes("already exists")) {
        console.log(`⚠️  ${email} — already exists (skipped)`);
      } else {
        console.log(`❌ ${email} — ERROR: ${error.message}`);
      }
    } else {
      console.log(`✅ ${email} — created (id: ${data.user.id})`);
    }
  }

  console.log(`\nDone. Tell attendees:`);
  console.log(`  URL: https://linkedrank.fr`);
  console.log(`  Password: ${TEMP_PASSWORD}`);
  console.log(`  They can change it in their profile after logging in.`);
}

main().catch(console.error);
