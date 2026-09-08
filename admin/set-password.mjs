// Sets the panel's password.
//
// Run this on the server, once:  npm run set-password
//
// The password is read from the terminal with echo off, hashed with scrypt, and
// only the hash and its salt are written to .credentials.json. The password
// itself is never written anywhere, never logged, and never leaves this process.

import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { writeFile, chmod } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);
const target = join(dirname(fileURLToPath(import.meta.url)), '.credentials.json');

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const onData = (char) => {
      // Redraw the prompt without the characters typed, so nothing lands in the
      // terminal's scrollback where it would outlive this run.
      if (['\n', '\r', ''].includes(String(char))) {
        process.stdin.removeListener('data', onData);
      } else {
        process.stdout.write(`\x1b[2K\r${question}`);
      }
    };
    process.stdin.on('data', onData);
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

const password = await askHidden('New panel password: ');
if (password.length < 12) {
  console.error('\nToo short. Use at least 12 characters — this is the only lock on the panel.');
  process.exit(1);
}
const again = await askHidden('Again: ');
if (password !== again) {
  console.error('\nThey do not match. Nothing was written.');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = await scrypt(password, salt, 64);

await writeFile(
  target,
  JSON.stringify(
    {
      salt: salt.toString('hex'),
      hash: hash.toString('hex'),
      // Rotating this invalidates every session that is currently signed in.
      sessionSecret: randomBytes(32).toString('hex'),
    },
    null,
    2,
  ) + '\n',
);
await chmod(target, 0o600).catch(() => {});

console.log('\nWritten to admin/.credentials.json (owner-readable only).');
console.log('Restart the panel for it to take effect.');
