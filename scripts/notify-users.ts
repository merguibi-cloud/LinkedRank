import "dotenv/config";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? "noreply@linkedrank.fr";
const SENDER_NAME = "LinkedRank";
const TEMP_PASSWORD = "LinkedRank2025!";

const users = [
  // Batch 1 — new accounts from first run
  { email: "safarcom.voyages@gmail.com", name: "Mohamed Larbi" },
  { email: "el_bouchra@hotmail.com",     name: "Bouchra" },
  { email: "meghara.lynda@gmail.com",    name: "Lynda" },
  { email: "assiabenmerayah27@gmail.com", name: "Assia" },
  { email: "karim.meftah@sfr.fr",        name: "Karim" },
  { email: "p.perrin54@wanadoo.fr",      name: "Pierre" },
  { email: "virginingues@gmail.com",     name: "Virginie" },
  // Batch 2
  { email: "cognitionetmouvement@gmail.com", name: "Yohan" },
  { email: "abdrahamane.daouda@gmail.com",   name: "Abdrahamane" },
  { email: "d.pompas@gmail.com",             name: "Daniel" },
  { email: "b.hilla78@gmail.com",            name: "Hilla" },
];

async function sendEmail(to: { email: string; name: string }) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to.email, name: to.name }],
      subject: "Votre accès LinkedRank est prêt !",
      htmlContent: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Votre accès LinkedRank</title>
</head>
<body style="margin:0; padding:0; background-color:#05050D; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#05050D; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#0F101C; border:1px solid #262838; border-radius:16px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:40px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#614AFC; background-image:linear-gradient(135deg,#614AFC,#E24EA0); border-radius:12px; width:40px; height:40px; text-align:center; vertical-align:middle;">
                    <span style="color:#ffffff; font-size:20px; line-height:40px;">&#9679;</span>
                  </td>
                  <td style="padding-left:10px; vertical-align:middle;">
                    <span style="font-size:20px; font-weight:700; color:#ffffff;">LinkedRank</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding:28px 32px 0 32px;">
              <h1 style="margin:0; font-size:22px; line-height:30px; font-weight:700; color:#ffffff;">
                Votre compte est prêt, ${to.name} !
              </h1>
            </td>
          </tr>

          <!-- Body copy -->
          <tr>
            <td align="center" style="padding:14px 32px 0 32px;">
              <p style="margin:0; font-size:15px; line-height:24px; color:#A3A3B8;">
                Votre accès LinkedRank a été créé. Voici vos identifiants de connexion :
              </p>
            </td>
          </tr>

          <!-- Credentials box -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#181928; border:1px solid #262838; border-radius:10px; padding:0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#6E6E85; width:90px;">Email</td>
                        <td style="padding:6px 0; font-size:14px; color:#ffffff;">${to.email}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#6E6E85;">Mot de passe</td>
                        <td style="padding:6px 0; font-size:14px; color:#ffffff; font-family:monospace; letter-spacing:0.5px;">${TEMP_PASSWORD}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:28px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#614AFC; background-image:linear-gradient(135deg,#614AFC,#E24EA0); border-radius:10px;">
                    <a href="https://linkedrank.fr"
                       style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;">
                      Se connecter →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td align="center" style="padding:20px 32px 0 32px;">
              <p style="margin:0; font-size:13px; line-height:20px; color:#6E6E85;">
                Une fois connecté(e), pensez à changer votre mot de passe dans votre profil.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="border-top:1px solid #262838;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 32px 32px 32px;">
              <p style="margin:0; font-size:12px; line-height:18px; color:#6E6E85;">
                &copy; LinkedRank &middot; <a href="https://www.linkedrank.fr" style="color:#6E6E85; text-decoration:underline;">linkedrank.fr</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err}`);
  }
}

async function main() {
  if (!BREVO_API_KEY) {
    console.error("❌ Missing BREVO_API_KEY in .env");
    process.exit(1);
  }

  const isTest = process.argv.includes("--test");
  const testEmail = process.argv[process.argv.indexOf("--test") + 1];

  if (isTest) {
    if (!testEmail || testEmail.startsWith("--")) {
      console.error("❌ Usage: npx tsx scripts/notify-users.ts --test you@email.com");
      process.exit(1);
    }
    console.log(`🧪 TEST MODE — sending to ${testEmail} only\n`);
    try {
      await sendEmail({ email: testEmail, name: "Test" });
      console.log(`✅ Test email sent to ${testEmail}`);
    } catch (err) {
      console.log(`❌ ${(err as Error).message}`);
    }
    return;
  }

  console.log(`Sending ${users.length} notification emails via Brevo...\n`);

  for (const user of users) {
    try {
      await sendEmail(user);
      console.log(`✅ ${user.email}`);
    } catch (err) {
      console.log(`❌ ${user.email} — ${(err as Error).message}`);
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
