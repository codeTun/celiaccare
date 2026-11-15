/**
 * Create an administrator account, or update an existing one (new password).
 *
 *   pnpm admin:create
 *       → asks the e-mail, the name and the password (hidden while you type)
 *
 *   pnpm admin:create --email admin@celiaccare.tn --name "Prénom Nom" --password "…" [--yes] [--reset-2fa]
 *       → without questions (⚠ a password typed in a command stays in the terminal history)
 *
 * Updating an existing account also unlocks it and signs it out on every device.
 * --reset-2fa (or answering "o") turns two-factor authentication off: the way back in
 * after losing the phone. The new password must follow the same rules as the admin panel.
 *
 * Runs with Node outside Next.js: relative imports, nothing marked "server-only".
 */
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

import { z } from "zod";

import { MAX_PASSWORD_LENGTH } from "../lib/auth/guard";
import { checkPasswordStrength, hashPassword } from "../lib/auth/password";
import { closeDb, db } from "../lib/prisma";

const USAGE = `
Créer ou mettre à jour un compte administrateur

  pnpm admin:create                       questions dans le terminal (recommandé)
  pnpm admin:create --email <e-mail> --name <nom> --password <mot de passe>

Options :
  --email       adresse e-mail de connexion
  --name        nom affiché dans l'administration
  --password    mot de passe (12 caractères minimum, lettres et chiffres)
  --yes, -y     remplacer sans demander si le compte existe déjà
  --reset-2fa   désactiver la double authentification (téléphone perdu)
  --help, -h    afficher cette aide
`;

const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());
const nameSchema = z.string().trim().min(2).max(80);

/* --------------------------------------------------------------------------
   Terminal questions
   -------------------------------------------------------------------------- */

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

async function confirm(question: string): Promise<boolean> {
  const answer = (await ask(`${question} (o/N) `)).toLowerCase();
  return answer === "o" || answer === "oui" || answer === "y" || answer === "yes";
}

/** Read a password without showing it on the screen (raw mode: the terminal does not echo). */
function askHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let value = "";
    const onData = (chunk: Buffer) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\r" || char === "\n") {
          finish();
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          // Ctrl+C
          finish();
          stdout.write("\n");
          reject(new Error("Annulé."));
          return;
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    };
    const finish = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
    };
    // Echo is turned off BEFORE the question is printed, so nothing typed can appear on screen.
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
    stdout.write(question);
  });
}

/** Problem with the password, or null when it is acceptable. */
function passwordProblem(password: string): string | null {
  if (password.length > MAX_PASSWORD_LENGTH) return `Maximum ${MAX_PASSWORD_LENGTH} caractères.`;
  return checkPasswordStrength(password);
}

async function askEmail(): Promise<string> {
  for (;;) {
    const parsed = emailSchema.safeParse(await ask("Adresse e-mail : "));
    if (parsed.success) return parsed.data;
    console.log("  ✗ Adresse e-mail invalide.");
  }
}

async function askName(current?: string): Promise<string> {
  for (;;) {
    const typed = await ask(current ? `Nom affiché [${current}] : ` : "Nom affiché (ex. Leila Ben Ali) : ");
    const parsed = nameSchema.safeParse(typed || current || "");
    if (parsed.success) return parsed.data;
    console.log("  ✗ Entre 2 et 80 caractères.");
  }
}

async function askPassword(): Promise<string> {
  for (;;) {
    const password = await askHidden("Mot de passe (12 caractères min., lettres et chiffres) : ");
    const problem = passwordProblem(password);
    if (problem) {
      console.log(`  ✗ ${problem}`);
      continue;
    }
    if ((await askHidden("Confirmez le mot de passe : ")) === password) return password;
    console.log("  ✗ Les deux mots de passe ne sont pas identiques.");
  }
}

/* --------------------------------------------------------------------------
   The steps
   -------------------------------------------------------------------------- */

type Flags = {
  email?: string;
  name?: string;
  password?: string;
  yes?: boolean;
  "reset-2fa"?: boolean;
  help?: boolean;
};

type ExistingAdmin = { id: number; name: string; totpEnabled: boolean };

function readFlags(): Flags {
  return parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      password: { type: "string" },
      yes: { type: "boolean", short: "y" },
      "reset-2fa": { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  }).values;
}

/** The value of a command-line option, checked with a zod schema. */
function checkedOption(schema: z.ZodType<string>, value: string, errorMessage: string): string {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new Error(errorMessage);
  return parsed.data;
}

async function chooseEmail(flags: Flags): Promise<string> {
  if (flags.email === undefined) return askEmail();
  return checkedOption(emailSchema, flags.email, "--email : adresse e-mail invalide.");
}

async function chooseName(flags: Flags, existing: ExistingAdmin | null): Promise<string> {
  if (flags.name === undefined) return askName(existing?.name);
  return checkedOption(nameSchema, flags.name, "--name : entre 2 et 80 caractères.");
}

async function choosePassword(flags: Flags, interactive: boolean): Promise<string> {
  if (flags.password === undefined) return askPassword();
  const problem = passwordProblem(flags.password);
  if (problem) throw new Error(`--password : ${problem}`);
  if (interactive) console.log("⚠ Pensez à effacer cette commande de l'historique du terminal.");
  return flags.password;
}

/** May we replace the password of this existing account? */
async function mayOverwrite(existing: ExistingAdmin, email: string, flags: Flags, interactive: boolean) {
  console.log(`Un compte existe déjà pour ${email} (${existing.name}).`);
  if (flags.yes) return true;
  if (interactive && (await confirm("Remplacer son mot de passe ?"))) return true;
  console.log(interactive ? "Rien n'a été modifié." : "Rien n'a été modifié (ajoutez --yes pour remplacer).");
  return false;
}

async function shouldResetTwoFactor(existing: ExistingAdmin | null, flags: Flags, interactive: boolean) {
  if (flags["reset-2fa"]) return true;
  if (!existing?.totpEnabled || !interactive || flags.yes) return false;
  return confirm("Désactiver aussi la double authentification (téléphone perdu) ?");
}

/** Create the account, or update it (also: unlocked and signed out everywhere). Returns its id. */
async function saveAdmin(input: {
  existing: ExistingAdmin | null;
  email: string;
  name: string;
  password: string;
  resetTwoFactor: boolean;
}): Promise<number> {
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  if (!input.existing) {
    const created = await db.orm.public.AdminUser.create({
      email: input.email,
      name: input.name,
      passwordHash,
      passwordChangedAt: now,
    });
    return created.id;
  }

  const adminId = input.existing.id;
  await db.orm.public.AdminUser.where((u) => u.id.eq(adminId)).update({
    name: input.name,
    passwordHash,
    passwordChangedAt: now,
    failedAttempts: 0,
    lockedUntil: null,
    ...(input.resetTwoFactor ? { totpEnabled: false, totpSecret: null } : {}),
  });
  // Signed out everywhere: whoever knew the old password loses access.
  await db.orm.public.AdminSession.where((s) => s.adminId.eq(adminId)).deleteAll();
  return adminId;
}

/* --------------------------------------------------------------------------
   Main
   -------------------------------------------------------------------------- */

async function main() {
  const flags = readFlags();
  if (flags.help) {
    console.log(USAGE);
    return;
  }

  const interactive = Boolean(stdin.isTTY);
  if (!interactive && (!flags.email || !flags.name || !flags.password)) {
    throw new Error(`Pas de terminal interactif : donnez --email, --name et --password.\n${USAGE}`);
  }

  const email = await chooseEmail(flags);
  const existing = await db.orm.public.AdminUser.select("id", "name", "totpEnabled")
    .where((u) => u.email.eq(email))
    .first();
  if (existing && !(await mayOverwrite(existing, email, flags, interactive))) return;

  const name = await chooseName(flags, existing);
  const password = await choosePassword(flags, interactive);
  const resetTwoFactor = await shouldResetTwoFactor(existing, flags, interactive);
  const adminId = await saveAdmin({ existing, email, name, password, resetTwoFactor });

  // Same journal as the admin panel (shown on the Sécurité page).
  const twoFactorNote = resetTwoFactor ? ", 2FA désactivée" : "";
  await db.orm.public.AuditLog.create({
    adminId: null,
    adminEmail: "script (pnpm admin:create)",
    action: existing ? "update" : "create",
    entity: "admin",
    entityId: String(adminId),
    details: existing ? `Mot de passe réinitialisé pour ${email}${twoFactorNote}, sessions fermées` : `Compte créé pour ${email}`,
    ipHash: null,
  });

  if (existing) console.log(`✓ Compte mis à jour : ${name} <${email}>${twoFactorNote}.`);
  else console.log(`✓ Compte créé : ${name} <${email}>. Connectez-vous sur /admin/login.`);
}

try {
  await main();
} catch (error) {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await closeDb();
}
