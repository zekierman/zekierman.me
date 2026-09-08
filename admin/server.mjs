// The panel that adds a project to zekierman.me.
//
// It runs on the VPS beside the site and writes the same files a person would
// write by hand: one JSON document per project under src/content/projects, and
// one webp under public/media/work. There is no database. The store is the repo,
// which means every change is a commit — readable, revertible, and backed up off
// the server the moment it is pushed.
//
// Everything it does is behind one session. Read the security notes as you go;
// they are the reason the code is shaped this way.

import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { execFile as execFileCb } from 'node:child_process';
import { readFile, writeFile, unlink, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

const execFile = promisify(execFileCb);
const scrypt = promisify(scryptCb);

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const PROJECTS = join(site, 'src', 'content', 'projects');
const SHOTS = join(site, 'public', 'media', 'work');
const MANIFEST = join(site, 'src', 'content', 'work-shots.json');
const TOOLKIT = join(site, 'src', 'content', 'toolkit.json');
const SETTINGS = join(site, 'src', 'content', 'settings.json');
const CREDENTIALS = join(here, '.credentials.json');

const PORT = Number(process.env.PORT ?? 4322);
// Bind to loopback: nginx terminates TLS and proxies in. The panel must never be
// reachable directly on a public port, because then it would be answering plain
// HTTP and the session cookie would cross the wire in the clear.
const HOST = process.env.HOST ?? '127.0.0.1';
const PUSH = process.env.GIT_PUSH === '1';

const SESSION_HOURS = 12;
const MAX_UPLOAD = 12 * 1024 * 1024;

// ---------------------------------------------------------------------------
// credentials and sessions

if (!existsSync(CREDENTIALS)) {
  console.error('No .credentials.json. Run `npm run set-password` first.');
  process.exit(1);
}
const creds = JSON.parse(await readFile(CREDENTIALS, 'utf8'));
const SECRET = Buffer.from(creds.sessionSecret, 'hex');

async function passwordMatches(password) {
  const derived = await scrypt(password, Buffer.from(creds.salt, 'hex'), 64);
  const stored = Buffer.from(creds.hash, 'hex');
  // Compare in constant time. A plain === leaks how much of the hash matched
  // through how long the comparison took, one byte at a time.
  return derived.length === stored.length && timingSafeEqual(derived, stored);
}

const sign = (value) => createHmac('sha256', SECRET).update(value).digest('hex');

function issueSession() {
  const expires = Date.now() + SESSION_HOURS * 3600_000;
  const body = `${expires}.${randomBytes(16).toString('hex')}`;
  return `${body}.${sign(body)}`;
}

function sessionValid(token) {
  if (typeof token !== 'string') return false;
  const cut = token.lastIndexOf('.');
  if (cut < 0) return false;
  const body = token.slice(0, cut);
  const mac = token.slice(cut + 1);
  const expected = sign(body);
  if (mac.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  return Number(body.split('.')[0]) > Date.now();
}

// A wrong password should cost the attacker time. Without this, the panel is a
// password oracle anyone can query as fast as their connection allows.
const attempts = new Map();
function throttled(ip) {
  const record = attempts.get(ip);
  if (!record) return false;
  if (Date.now() - record.at > 15 * 60_000) {
    attempts.delete(ip);
    return false;
  }
  return record.count >= 8;
}
function noteFailure(ip) {
  const record = attempts.get(ip) ?? { count: 0, at: Date.now() };
  record.count += 1;
  record.at = Date.now();
  attempts.set(ip, record);
}

// ---------------------------------------------------------------------------
// the content store

// A slug becomes a filename and an image name. Anything outside this alphabet —
// a slash, a dot, a null — is how a write escapes the directory it belongs in.
const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/;
const slugOk = (s) => typeof s === 'string' && SLUG.test(s);

const LOCALE_FIELDS = ['name', 'meta', 'question', 'note'];

function validate(body) {
  const errors = [];
  if (!slugOk(body.slug)) errors.push('slug: lowercase letters, digits and dashes only');

  let href;
  try {
    href = new URL(body.href);
    if (href.protocol !== 'https:') errors.push('href: must be https');
  } catch {
    errors.push('href: not a URL');
  }

  const order = Number(body.order);
  if (!Number.isInteger(order) || order < 1 || order > 99) errors.push('order: 1–99');

  const out = { order, href: body.href, image: `/media/work/${body.slug}.webp` };
  for (const locale of ['tr', 'en']) {
    const given = body[locale] ?? {};
    const filled = {};
    for (const field of LOCALE_FIELDS) {
      const value = typeof given[field] === 'string' ? given[field].trim() : '';
      if (!value) errors.push(`${locale}.${field}: required`);
      if (value.length > 1200) errors.push(`${locale}.${field}: too long`);
      filled[field] = value;
    }
    out[locale] = filled;
  }
  return { errors, doc: out };
}

// ---------------------------------------------------------------------------
// the bench inventory
//
// Written as one array rather than a file per tool: the list is short and is
// reordered far more often than it is added to, so a single write beats
// renumbering eleven documents. The panel sends the whole list back, which also
// makes reordering nothing more than sending it in a different sequence.

// A simple-icons slug. Empty is allowed and means "no mark exists for this" —
// the page falls back to a monogram rather than breaking.
const ICON = /^[a-z0-9.-]{0,40}$/;

function validateToolkit(list) {
  const errors = [];
  if (!Array.isArray(list)) return { errors: ['toolkit: expected a list'], docs: [] };
  if (list.length > 40) errors.push('toolkit: at most 40 tools');

  const seen = new Set();
  const docs = list.map((raw, i) => {
    const id = typeof raw?.id === 'string' ? raw.id : '';
    if (!slugOk(id)) errors.push(`#${i + 1}: id must be lowercase letters, digits and dashes`);
    if (seen.has(id)) errors.push(`#${i + 1}: duplicate id "${id}"`);
    seen.add(id);

    const name = typeof raw?.name === 'string' ? raw.name.trim() : '';
    if (!name) errors.push(`#${i + 1}: name is required`);
    if (name.length > 40) errors.push(`#${i + 1}: name too long`);

    const icon = typeof raw?.icon === 'string' ? raw.icon.trim().toLowerCase() : '';
    if (!ICON.test(icon)) errors.push(`#${i + 1}: icon must be a simple-icons slug`);

    // Order is the position it arrives in. Sending the list in a new sequence is
    // how it is reordered; nobody should have to renumber by hand.
    return { id, order: i + 1, name, icon };
  });
  return { errors, docs };
}

async function listProjects() {
  if (!existsSync(PROJECTS)) return [];
  const files = (await readdir(PROJECTS)).filter((f) => f.endsWith('.json'));
  const docs = await Promise.all(
    files.map(async (f) => ({ slug: f.replace(/\.json$/, ''), ...JSON.parse(await readFile(join(PROJECTS, f), 'utf8')) })),
  );
  return docs.sort((a, b) => a.order - b.order);
}

// The manifest is what lets the page reserve the right box for a picture whose
// shape it cannot know until the file exists. Rebuilt from the files themselves
// rather than tracked alongside them, so it cannot drift.
async function rebuildManifest() {
  const files = (await readdir(SHOTS)).filter((f) => f.endsWith('.webp'));
  const entries = [];
  for (const file of files) {
    const { stdout } = await execFile('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height', '-of', 'csv=p=0',
      join(SHOTS, file),
    ]);
    const [w, h] = stdout.trim().split(',').map(Number);
    entries.push({ name: file.replace(/\.webp$/, ''), w, h });
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(MANIFEST, JSON.stringify(entries) + '\n');
}

// Only these four, checked against the file's own first bytes. An extension is a
// claim by whoever uploaded it; the magic number is the file telling the truth.
const MAGIC = [
  { ext: 'png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { ext: 'jpg', bytes: [0xff, 0xd8, 0xff] },
  { ext: 'webp', bytes: [0x52, 0x49, 0x46, 0x46] },
  { ext: 'gif', bytes: [0x47, 0x49, 0x46, 0x38] },
];
const looksLikeImage = (buf) =>
  MAGIC.some((m) => m.bytes.every((b, i) => buf[i] === b));

async function storeShot(slug, buffer) {
  const temp = join(SHOTS, `.upload-${slug}`);
  await writeFile(temp, buffer);
  try {
    // The same derivation tools/encode.sh performs: one width, never cropped, so
    // the picture keeps its own shape.
    await execFile('ffmpeg', [
      '-y', '-v', 'error', '-i', temp,
      '-vf', 'scale=1400:-2:flags=lanczos', '-q:v', '82',
      join(SHOTS, `${slug}.webp`),
    ]);
  } finally {
    await unlink(temp).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// publishing

// One build at a time. Two overlapping `astro build` runs write the same output
// directory, and the site that survives is whichever finished last.
let publishing = null;

async function publish(message) {
  if (publishing) return publishing;
  publishing = (async () => {
    await execFile('git', ['add', 'src/content', 'public/media/work'], { cwd: site });
    const { stdout: staged } = await execFile('git', ['diff', '--cached', '--name-only'], { cwd: site });
    if (staged.trim()) {
      await execFile('git', ['commit', '-m', message], { cwd: site });
      if (PUSH) await execFile('git', ['push', 'origin', 'HEAD'], { cwd: site }).catch((e) => {
        // A failed push must not fail the publish: the content is committed, the
        // site still builds, and the remote can be caught up by hand.
        console.error('push failed:', e.message);
      });
    }
    await execFile('npm', ['run', 'build'], { cwd: site, maxBuffer: 8 * 1024 * 1024 });
  })().finally(() => {
    publishing = null;
  });
  return publishing;
}

// ---------------------------------------------------------------------------
// routes

const app = Fastify({ bodyLimit: 1024 * 1024, trustProxy: true });
await app.register(cookie);
await app.register(multipart, { limits: { fileSize: MAX_UPLOAD, files: 1 } });
// Served under /admin/, which is where the reverse proxy hands it over. Mounting
// at / would work behind a proxy that strips the prefix, but then every path the
// page asks for would have to be rewritten too — including /api. One prefix, both
// sides agreeing on it, is fewer moving parts.
await app.register(fastifyStatic, { root: join(here, 'public'), prefix: '/admin/' });

// So that /admin lands somewhere rather than 404ing on a missing slash.
app.get('/admin', async (_req, reply) => reply.redirect('/admin/', 308));

app.addHook('onRequest', async (req, reply) => {
  if (req.url.startsWith('/api/') && req.url !== '/api/login') {
    if (!sessionValid(req.cookies.session)) return reply.code(401).send({ error: 'unauthorised' });
  }
  // The session cookie is SameSite=Strict, so a form posted from another origin
  // arrives without it and fails the check above. This is the second lock: a
  // header a cross-origin form cannot set.
  if (req.method !== 'GET' && req.url.startsWith('/api/') && req.headers['x-panel'] !== '1') {
    return reply.code(400).send({ error: 'bad request' });
  }
});

app.post('/api/login', async (req, reply) => {
  const ip = req.ip;
  if (throttled(ip)) return reply.code(429).send({ error: 'too many attempts, wait 15 minutes' });
  // Trimmed, and the same trim is applied when the password is set. A password
  // pasted from a note or a manager routinely carries a trailing space or
  // newline; the terminal that set it dropped that and the browser that sends it
  // keeps it, and the two then never match while both look identical on screen.
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  if (!password || !(await passwordMatches(password))) {
    noteFailure(ip);
    return reply.code(401).send({ error: 'wrong password' });
  }
  attempts.delete(ip);
  reply.setCookie('session', issueSession(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.INSECURE_COOKIE !== '1',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  });
  return { ok: true };
});

app.post('/api/logout', async (_req, reply) => {
  reply.clearCookie('session', { path: '/' });
  return { ok: true };
});

app.get('/api/session', async (req) => ({ signedIn: sessionValid(req.cookies.session) }));

app.get('/api/projects', async () => ({ projects: await listProjects() }));

app.get('/api/toolkit', async () => {
  if (!existsSync(TOOLKIT)) return { toolkit: [] };
  return { toolkit: JSON.parse(await readFile(TOOLKIT, 'utf8')) };
});

app.put('/api/toolkit', async (req, reply) => {
  const { errors, docs } = validateToolkit(req.body?.toolkit);
  if (errors.length) return reply.code(400).send({ error: errors.join('; ') });
  await writeFile(TOOLKIT, JSON.stringify(docs, null, 2) + '\n');
  await publish('Update the bench inventory\n\nWritten from the panel.');
  return { ok: true, count: docs.length };
});

app.get('/api/settings', async () => {
  if (!existsSync(SETTINGS)) return { settings: { githubUsername: '' } };
  return { settings: JSON.parse(await readFile(SETTINGS, 'utf8')) };
});

app.put('/api/settings', async (req, reply) => {
  // Deliberately narrow. Secrets are not settings: the GitHub token lives in the
  // server's environment and is never readable or writable from here, so a
  // compromised panel session cannot walk away with it.
  const name = typeof req.body?.githubUsername === 'string' ? req.body.githubUsername.trim() : '';
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(name)) {
    return reply.code(400).send({ error: 'that is not a GitHub username' });
  }
  await writeFile(SETTINGS, JSON.stringify({ githubUsername: name }, null, 2) + '\n');
  await publish('Update site settings\n\nWritten from the panel.');
  return { ok: true };
});

app.post('/api/projects', async (req, reply) => {
  let fields = {};
  let upload = null;

  for await (const part of req.parts()) {
    if (part.type === 'file') {
      const buffer = await part.toBuffer();
      if (buffer.length === 0) continue;
      if (!looksLikeImage(buffer)) return reply.code(400).send({ error: 'that file is not an image' });
      upload = buffer;
    } else if (part.fieldname === 'doc') {
      try {
        fields = JSON.parse(part.value);
      } catch {
        return reply.code(400).send({ error: 'malformed form' });
      }
    }
  }

  const { errors, doc } = validate(fields);
  if (errors.length) return reply.code(400).send({ error: errors.join('; ') });

  const target = join(PROJECTS, `${fields.slug}.json`);
  const isNew = !existsSync(target);
  if (isNew && !upload) return reply.code(400).send({ error: 'a new project needs an image' });

  await mkdir(PROJECTS, { recursive: true });
  if (upload) {
    await storeShot(fields.slug, upload);
    await rebuildManifest();
  }
  await writeFile(target, JSON.stringify(doc, null, 2) + '\n');

  await publish(`${isNew ? 'Add' : 'Update'} ${fields.slug}\n\nWritten from the panel.`);
  return { ok: true, slug: fields.slug };
});

app.delete('/api/projects/:slug', async (req, reply) => {
  const { slug } = req.params;
  if (!slugOk(slug)) return reply.code(400).send({ error: 'bad slug' });
  const target = join(PROJECTS, `${slug}.json`);
  if (!existsSync(target)) return reply.code(404).send({ error: 'no such project' });

  await unlink(target);
  await unlink(join(SHOTS, `${slug}.webp`)).catch(() => {});
  await rebuildManifest();
  await publish(`Remove ${slug}\n\nWritten from the panel.`);
  return { ok: true };
});

await app.listen({ port: PORT, host: HOST });
console.log(`panel on http://${HOST}:${PORT}`);
