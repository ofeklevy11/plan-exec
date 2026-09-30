# PLAN-LEDGER — <plan name>

> Written at Phase 0 of `plan-exec`, edited **during** execution, read by
> `ledger-check.mjs`. Copy this file to the project (next to the plan) and fill it in.

- **Plan file:** `<relative path to the approved plan — the audit reads THIS, not the ledger>`
- **Approved by user:** `<quote the approval message>`
- **Commitments extracted:** `<N>`  ← the contract. The final report accounts for all N.

---

## Format rules (the checker enforces these)

Six columns, exactly, in this order:

| ID | Phase | Commitment | Acceptance | Proof | Status |

- **ID** — `<PHASE>-<n>`, unique across the file. Addendum rows use `ADD-<n>`.
- **Phase** — the plan's own phase label (`P0`…`P7`, `ADD`). Used by `--phase` filtering.
- **Commitment** — **verbatim quote from the plan.** Not a paraphrase. If it is long, quote
  the operative clause. One commitment per row; never merge two.
- **Acceptance** — the specific check that decides this row, named **before** execution,
  including the tool that will run it. If you cannot write this, re-read the plan.
- **Proof** — comma-separated. Each entry is either:
  - a **path** that must exist on disk (`shots/p1-1440.png`, `src/chat/stream.js`), or
  - `measured:<value>` for a literal measurement (`measured:58fps @390px`), or
  - `reason:<why>` — permitted **only** on `blocked` rows.
- **Status** — one of `todo` · `wip` · `done` · `blocked`. Nothing else parses.

Keep an **Assumptions** section below the table: every decision taken instead of stopping to
ask. Keep a **Deferred questions** section: the non-blocking questions for the final report.

---

## Ledger

| ID | Phase | Commitment | Acceptance | Proof | Status |
|---|---|---|---|---|---|
| P0-1 | P0 | `"<verbatim quote from the plan>"` | `<the check + the tool that runs it>` | `<path or measured:…>` | todo |
| P0-2 | P0 | `"…"` | `…` | `—` | todo |
| P1-1 | P1 | `"…"` | `…` | `—` | todo |
| ADD-1 | ADD | `"<the user's own words, from a message after approval>"` | `…` | `—` | todo |

---

## Assumptions taken during execution

| ID | Row | Decision taken instead of asking | Why this default |
|---|---|---|---|
| A1 | P2-3 | `…` | `…` |

## Deferred questions (non-blocking — delivered with the final report)

1. `…`

## Out-of-scope observations (noticed, deliberately not built)

1. `…`

---

## Audit rounds

| Round | N | Confirmed | Unproven | Missing | New defects | Verdict |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |

Loop ends after **two consecutive** `CLEAN` rounds. Hard cap 4.

---

## Gate commands

```bash
node "<resolved-skill-directory>/ledger-check.mjs" PLAN-LEDGER.md
node "<resolved-skill-directory>/ledger-check.mjs" PLAN-LEDGER.md --phase P3
node "<resolved-skill-directory>/ledger-check.mjs" PLAN-LEDGER.md --phase P3 --allow-open
```

Replace `<resolved-skill-directory>` with the actual installed skill directory.
Quote the complete path. Do not assume a particular agent or home-directory layout.

`--allow-open` permits `todo`/`wip` rows inside the selected scope for intermediate checks. The final run, over
the whole ledger, must pass **without** it.

A passed mechanical gate checks ledger structure and recorded evidence only. It does
not prove evidence quality or completion of blocked commitments; the full audit does.
