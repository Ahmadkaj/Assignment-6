/**
 * End-to-end test of every route. Start the server first (npm run dev),
 * then run: npm test
 * Results are printed and saved to test-evidence/test-results.md
 */
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const out = [];
let passed = 0;
let failed = 0;

async function call(name, method, url, body, expected, rawBody) {
  const opts = { method, headers: {} };
  if (rawBody !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = rawBody;
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(BASE + url, opts);
  const json = await res.json().catch(() => null);
  const ok = res.status === expected;
  ok ? passed++ : failed++;

  const line = `${ok ? 'PASS' : 'FAIL'}  ${method} ${url}  -> ${res.status} (expected ${expected})  ${name}`;
  console.log(line);

  out.push(`### ${passed + failed}. ${ok ? "✅" : "❌"} ${name}`);
  out.push(`\`${method} ${url}\` → **${res.status}** (expected ${expected})\n`);
  if (opts.body) out.push('Request body:\n```json\n' + opts.body + '\n```');
  out.push('Response body:\n```json\n' + JSON.stringify(json, null, 2) + '\n```\n');
  return json;
}

(async () => {
  try {
    // ---- Happy path: full CRUD ----
    const created = await call('Create a task', 'POST', '/tasks', {
      title: 'Write README',
      description: 'Document every route with examples',
      priority: 'high',
      dueDate: '2026-11-20',
    }, 201);
    const id = created.data.id;

    await call('List all tasks', 'GET', '/tasks', undefined, 200);
    await call('List tasks filtered by priority', 'GET', '/tasks?priority=high', undefined, 200);
    await call('Get one task', 'GET', `/tasks/${id}`, undefined, 200);
    await call('Update a task', 'PUT', `/tasks/${id}`, {
      title: 'Write README (final)',
      description: 'Every route documented',
      status: 'completed',
      priority: 'high',
      dueDate: '2026-11-20',
    }, 200);
    await call('Get updated task (persisted)', 'GET', `/tasks/${id}`, undefined, 200);
    await call('Delete a task', 'DELETE', `/tasks/${id}`, undefined, 200);

    // ---- Error cases ----
    await call('Get deleted task -> 404', 'GET', `/tasks/${id}`, undefined, 404);
    await call('Update missing task -> 404', 'PUT', '/tasks/999999', { title: 'x' }, 404);
    await call('Delete missing task -> 404', 'DELETE', '/tasks/999999', undefined, 404);
    await call('Invalid id -> 400', 'GET', '/tasks/abc', undefined, 400);
    await call('Create without title -> 400', 'POST', '/tasks', { description: 'no title' }, 400);
    await call('Create with invalid fields -> 400', 'POST', '/tasks', {
      title: '   ',
      status: 'done',
      priority: 'urgent',
      dueDate: '2026-13-45',
    }, 400);
    await call('Malformed JSON -> 400', 'POST', '/tasks', undefined, 400, '{"title": "oops",');
    await call('Invalid filter -> 400', 'GET', '/tasks?status=finished', undefined, 400);
    await call('Unknown route -> 404', 'GET', '/nothing-here', undefined, 404);
    await call('Server still alive after bad input', 'GET', '/tasks', undefined, 200);
  } catch (err) {
    console.error(`\nCould not reach ${BASE}. Is the server running? (npm run dev)\n`, err.message);
    process.exit(1);
  }

  const header = [
    '# API Test Evidence',
    '',
    `Run on ${new Date().toISOString()} against \`${BASE}\` using \`npm test\` (scripts/api-test.js).`,
    '',
    `**Result: ${passed} passed, ${failed} failed.**`,
    '',
  ];
  const dir = path.join(__dirname, '..', 'test-evidence');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'test-results.md'), header.concat(out).join('\n'));
  console.log(`\n${passed} passed, ${failed} failed. Saved to test-evidence/test-results.md`);
  process.exit(failed ? 1 : 0);
})();
