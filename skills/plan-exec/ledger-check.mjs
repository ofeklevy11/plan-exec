#!/usr/bin/env node
/* plan-exec — the mechanical ledger gate.
 *
 *   node ledger-check.mjs [PLAN-LEDGER.md] [--phase P3] [--allow-open] [--no-proof-check]
 *
 * Exists because "done" is a claim and a claim is not evidence. A row may only be `done`
 * if it carries proof: a path that exists on disk, or an explicit measured value. Rows
 * still open, unparseable statuses, duplicate IDs, missing acceptance tests and dead proof
 * paths all fail the gate.
 *
 * Exit codes:  0 = gate passed   1 = defects found   2 = usage / parse error
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name) => { const i = argv.indexOf(name); return i > -1 ? argv[i + 1] : null; };

if (flag('--help') || flag('-h')) {
  console.log('usage: node ledger-check.mjs [ledger.md] [--phase P3] [--allow-open] [--no-proof-check]');
  process.exit(0);
}

const onlyPhase = opt('--phase');
const allowOpen = flag('--allow-open');
const checkProofPaths = !flag('--no-proof-check');
const file = argv.find((a) => !a.startsWith('--') && a !== onlyPhase) || 'PLAN-LEDGER.md';

if (!existsSync(file)) {
  console.error(`ledger not found: ${file}`);
  console.error('Phase 0 of plan-exec writes this file. A plan with no ledger cannot be gated.');
  process.exit(2);
}

const ledgerPath = path.resolve(file);
const ledgerDir = path.dirname(ledgerPath);
const lines = readFileSync(ledgerPath, 'utf8').split(/\r?\n/);

const HEADER = ['id', 'phase', 'commitment', 'acceptance', 'proof', 'status'];
const STATUSES = new Set(['todo', 'wip', 'done', 'blocked']);
const OPEN = new Set(['todo', 'wip']);
const NONE = new Set(['', '-', '—', '–', 'n/a', 'na', 'tbd']);

/* Strip the markdown decoration the ledger is written with, so `` `path` `` and
   **bold** compare as plain text. */
const clean = (s) => s.replace(/`/g, '').replace(/\*\*/g, '').trim();
const isNone = (s) => NONE.has(s.toLowerCase());

/* ---------- parse ----------
   Anchored on the six-column ledger header, because a plan ledger contains other
   tables (assumptions, audit rounds) and column count alone would swallow them. */
const rows = [];
const malformed = [];
let inTable = false;
let sawHeader = false;

for (const [i, raw] of lines.entries()) {
  const line = raw.trim();
  if (!line.startsWith('|')) { inTable = false; continue; }

  const cells = line.split('|').slice(1, -1).map((c) => c.trim());
  const norm = cells.map((c) => clean(c).toLowerCase());

  if (cells.length === 6 && HEADER.every((h, k) => norm[k] === h)) {
    inTable = true; sawHeader = true; continue;                    // the ledger header
  }
  if (!inTable) continue;                                          // some other table
  if (cells.length && /^:?-{2,}:?$/.test(cells[0])) continue;      // separator row
  if (cells.length !== 6) {
    malformed.push({ line: i + 1, n: cells.length, text: line.slice(0, 90) });
    continue;
  }
  if (/^<.*>$/.test(clean(cells[0]))) continue;                    // untouched template row

  const [id, phase, commitment, acceptance, proof, status] = cells.map(clean);
  rows.push({ line: i + 1, id, phase, commitment, acceptance, proof, status: status.toLowerCase() });
}

if (!sawHeader) {
  console.error(`${file}: no ledger table found. It must start with the exact header:`);
  console.error('  | ID | Phase | Commitment | Acceptance | Proof | Status |');
  console.error('See LEDGER-TEMPLATE.md.');
  process.exit(2);
}
if (!rows.length && !malformed.length) {
  console.error(`${file}: the ledger table has a header but no filled rows.`);
  process.exit(2);
}

/* ---------- ledger integrity (always global — a corrupt ledger cannot gate anything) ---------- */
const integrity = [];
for (const m of malformed) {
  integrity.push({ line: m.line, id: '(malformed)', why: `row has ${m.n} columns, expected 6 — ${m.text}` });
}
const seen = new Map();
for (const row of rows) {
  if (!row.id) { integrity.push({ line: row.line, id: '(no id)', why: 'row has no ID' }); continue; }
  if (seen.has(row.id)) {
    integrity.push({ line: row.line, id: row.id, why: `duplicate ID — also on line ${seen.get(row.id)}` });
  } else seen.set(row.id, row.line);
}

/* ---------- scope ---------- */
const scoped = onlyPhase
  ? rows.filter((r) => r.phase.toLowerCase() === onlyPhase.toLowerCase())
  : rows;

if (onlyPhase && !scoped.length) {
  console.error(`no rows with phase "${onlyPhase}". Phases present: ${[...new Set(rows.map((r) => r.phase))].join(', ')}`);
  process.exit(2);
}

/* ---------- validate the scoped rows ---------- */
const defects = [];
const fail = (row, why) => defects.push({ line: row.line, id: row.id, why, commitment: row.commitment });

for (const row of scoped) {
  if (!STATUSES.has(row.status)) {
    fail(row, `status "${row.status || '(empty)'}" is not one of todo/wip/done/blocked`);
    continue;
  }
  if (isNone(row.commitment)) fail(row, 'commitment is empty — every row quotes the plan verbatim');
  if (isNone(row.acceptance)) fail(row, 'no acceptance test — it is written BEFORE execution, not after');

  const entries = row.proof.split(',').map(clean).filter((p) => p && !isNone(p));

  if (row.status === 'done') {
    if (!entries.length) {
      fail(row, 'marked done with no proof — a path on disk, or measured:<value>');
      continue;
    }
    for (const entry of entries) {
      if (/^measured:/i.test(entry)) {
        if (entry.slice(9).trim().length < 3) fail(row, `"${entry}" carries no actual measurement`);
        continue;
      }
      if (/^reason:/i.test(entry)) { fail(row, 'reason: is only valid on a blocked row'); continue; }
      if (/^(should|probably|presumably|looks|seems|assume|i believe|fine|ok|yes|done)\b/i.test(entry)) {
        fail(row, `"${entry}" is an assertion, not evidence`);
        continue;
      }
      if (checkProofPaths && !existsSync(path.resolve(ledgerDir, entry)) && !existsSync(path.resolve(entry))) {
        fail(row, `proof path does not exist: ${entry}`);
      }
    }
  }

  if (row.status === 'blocked' && !entries.some((e) => /^reason:/i.test(e))) {
    fail(row, 'blocked without reason:<why> — a block with no stated cause cannot be reviewed');
  }

  if (OPEN.has(row.status) && !allowOpen) {
    fail(row, `still ${row.status} — the plan is not finished`);
  }
}

/* ---------- report ---------- */
const count = (s) => scoped.filter((r) => r.status === s).length;
const scope = onlyPhase ? `phase ${onlyPhase}` : 'whole ledger';
const show = (list, heading) => {
  console.log(`\n${heading}\n`);
  for (const d of list) {
    console.log(`  line ${String(d.line).padStart(4)}  ${(d.id || '(no id)').padEnd(9)} ${d.why}`);
    if (d.commitment && !isNone(d.commitment)) console.log(`             ${d.commitment.slice(0, 96)}`);
  }
};

console.log(`ledger: ${path.relative(process.cwd(), ledgerPath) || file}`);
console.log(`scope : ${scope} — ${scoped.length} of ${rows.length} commitment(s)`);
console.log(`status: done ${count('done')} · wip ${count('wip')} · todo ${count('todo')} · blocked ${count('blocked')}`);

if (integrity.length) show(integrity, `LEDGER INTEGRITY — ${integrity.length} problem(s) (ledger-wide, not scoped):`);
if (defects.length) show(defects, `GATE FAILED — ${defects.length} defect(s) in ${scope}:`);

if (!integrity.length && !defects.length) {
  console.log(`\nGATE PASSED — every row in ${scope} is accounted for with proof.`);
  process.exit(0);
}
console.log('\nFix the rows, not the checker.');
process.exit(1);
