// Refreshes the cached GitHub contribution calendar.
//
//   node tools/fetch-github.mjs
//
// Run it before a build, or on a schedule. It is deliberately separate from the
// build: the page used to fetch this itself, which meant a slow or unreachable
// GitHub held the whole build hostage — undici's connect timeout is ten seconds
// and the build ran from 2.4s to 14.5s waiting for it, twice, once per page.
// Worse, when the fetch failed there was no data at all, so a network hiccup on
// the deploy machine silently shipped a site with a hole in it.
//
// So the calendar is cached in the repo and the page only ever reads that file.
// Contributions update once a day; nothing here needs to be fresher than that.
//
// This script never fails the pipeline. If GitHub cannot be reached it leaves
// the last good file exactly where it is and exits 0 — a stale graph is a far
// better outcome than a broken deploy.

import https from 'node:https';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// This uses node:https rather than fetch, and that is not an accident. On at
// least one Windows network here, undici — the client behind fetch — cannot get
// a connection to api.github.com and sits until it times out, while the same
// request over node:https with the socket pinned to IPv4 returns in half a
// second. `dns.setDefaultResultOrder('ipv4first')` does not help, because undici
// resolves and connects on its own. The stdlib client is also one fewer moving
// part in a script whose entire job is to be dull and reliable.

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SETTINGS = join(root, 'src', 'content', 'settings.json');
const CACHE = join(root, 'src', 'content', 'github-activity.json');

const TIMEOUT_MS = 8000;

const token = process.env.GITHUB_TOKEN;

async function settings() {
  if (!existsSync(SETTINGS)) return { githubUsername: '' };
  try {
    return JSON.parse(await readFile(SETTINGS, 'utf8'));
  } catch {
    return { githubUsername: '' };
  }
}

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

/** Leaves whatever is cached in place and says why. Never throws. */
function giveUp(reason) {
  const had = existsSync(CACHE);
  console.warn(`github: ${reason} — ${had ? 'keeping the cached calendar' : 'no cache to fall back on'}`);
  process.exit(0);
}

const { githubUsername: login } = await settings();
if (!login) giveUp('no username in settings.json');
if (!token) giveUp('GITHUB_TOKEN is not set');

/** POSTs the query and resolves with { status, headers, body }. */
function ask(payload) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        host: 'api.github.com',
        path: '/graphql',
        method: 'POST',
        // Pinned: see the note at the top of this file.
        family: 4,
        timeout: TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'zekierman.me',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      },
    );
    request.on('timeout', () => {
      request.destroy(new Error('timed out'));
    });
    request.on('error', reject);
    request.end(payload);
  });
}

let response;
try {
  response = await ask(JSON.stringify({ query: QUERY, variables: { login } }));
} catch (error) {
  giveUp(`could not reach the API (${error.message})`);
}

if (response.status !== 200) giveUp(`API returned ${response.status}`);

let result;
try {
  result = JSON.parse(response.body);
} catch {
  giveUp('the API sent something that was not JSON');
}
if (result.errors) giveUp(`API said: ${result.errors.map((e) => e.message).join('; ')}`);

const calendar = result?.data?.user?.contributionsCollection?.contributionCalendar;
if (!calendar?.weeks?.length) giveUp('the response carried no calendar');

// `fetchedAt` is for a person reading the file later, not for the page: it is the
// only way to tell a graph that is quiet from one that stopped being refreshed.
await writeFile(
  CACHE,
  JSON.stringify({ login, fetchedAt: new Date().toISOString(), ...calendar }, null, 2) + '\n',
);

const remaining = response.headers['x-ratelimit-remaining'];
console.log(
  `github: ${calendar.totalContributions} contributions over ${calendar.weeks.length} weeks` +
    (remaining ? ` (${remaining} API points left this hour)` : ''),
);
