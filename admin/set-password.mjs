// Sets — or checks — the panel's password.
//
//   npm run set-password     write a new one
//   npm run check-password   test one against what is stored
//
// The password is read from the terminal with the echo suppressed, hashed with
// scrypt, and only the hash and its salt are written. It is never written to
// disk, never logged, and never leaves this process.
//
// The muting is done by replacing readline's own output writer rather than by
// attaching a second listener to stdin. The earlier version did the latter, and
// two readers pulling on the same stream is how a typed password arrives
// truncated — which is exactly what happened: the file was written correctly and
// the login then rejected the very password that had just been typed.

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, chmod } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);
const target = join(dirname(fileURLToPath(import.meta.url)), '.credentials.json');
const checking = process.argv.includes('--check');

function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });

    let hide = false;
    // readline routes everything it echoes through this. Swallowing it while the
    // answer is being typed hides the password without touching stdin at all.
    rl._writeToOutput = (chunk) => {
      if (!hide) rl.output.write(chunk);
    };

    rl.question(question, (answer) => {
      hide = false;
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
    hide = true;
  });
}

/** Non-ASCII survives a browser fine, but a terminal's encoding is another matter. */
function warnAboutCharacters(password) {
  // eslint-disable-next-line no-control-regex
  if (/[^\x20-\x7E]/.test(password)) {
    console.warn(
      '\nNote: this password contains characters outside plain ASCII.\n' +
        'A browser will send them as UTF-8, but an SSH session may not encode them\n' +
        'the same way, and then the two will not match. Letters, digits and\n' +
        'punctuation from the English keyboard are the safe set here.',
    );
  }
}

async function stored() {
  if (!existsSync(target)) {
    console.error('No .credentials.json yet. Run without --check first.');
    process.exit(1);
  }
  return JSON.parse(await readFile(target, 'utf8'));
}

if (checking) {
  const creds = await stored();
  const password = await ask('Password to check: ');
  const derived = await scrypt(password, Buffer.from(creds.salt, 'hex'), 64);
  const known = Buffer.from(creds.hash, 'hex');
  const ok = derived.length === known.length && timingSafeEqual(derived, known);
  console.log(ok ? '\nMATCH — this is the panel password.' : '\nNO MATCH — the panel would reject this.');
  if (!ok) warnAboutCharacters(password);
  process.exit(ok ? 0 : 1);
}

const password = await ask('New panel password: ');
if (password.length < 12) {
  console.error(`\nToo short (${password.length} characters). Use at least 12 — this is the only lock on the panel.`);
  process.exit(1);
}
const again = await ask('Again: ');
if (password !== again) {
  console.error('\nThey do not match. Nothing was written.');
  process.exit(1);
}
warnAboutCharacters(password);

const salt = randomBytes(16);
const hash = await scrypt(password, salt, 64);

await writeFile(
  target,
  JSON.stringify(
    {
      salt: salt.toString('hex'),
      hash: hash.toString('hex'),
      // Rotating this invalidates every session currently signed in.
      sessionSecret: randomBytes(32).toString('hex'),
    },
    null,
    2,
  ) + '\n',
);
await chmod(target, 0o600).catch(() => {});

console.log(`\nWritten to admin/.credentials.json (${password.length} characters, owner-readable only).`);
console.log('Check it with:  npm run check-password');
console.log('Then restart:   sudo systemctl restart zekierman-panel');
