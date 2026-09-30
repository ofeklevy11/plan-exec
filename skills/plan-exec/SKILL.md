---
name: plan-exec
description: Execute an explicitly approved plan end-to-end without routine continuation prompts, track every commitment in a file-backed ledger, verify evidence, and audit completeness until two consecutive clean audits or the four-round cap. Use when the user approves a plan and asks to execute it fully, without skipping steps.
---

# PLAN-EXEC — full execution, then prove it

You have an approved plan. Your job is not to make progress on it. Your job is to **finish
it**, and then to **prove to a hostile reader that you finished it** — item by item, against
the plan document itself rather than against your memory of it.

**Core thesis: a plan is not done when the work feels done. It is done when every
commitment in the plan file has a named piece of evidence attached to it.**

The two failure modes this skill exists to prevent:
1. **Silent shortfall** — 90% is built, the report says "done", and the missing 10% is the
   part the user cared about most.
2. **Unverified claim** — the code was written, nothing was run, and "implemented" was
   reported as "working".

Read `AUDIT-PROTOCOL.md` (same directory) before Phase 4. Use `LEDGER-TEMPLATE.md` for the
ledger format and `ledger-check.mjs` as the mechanical gate.

---

## The execution phases

```
0 EXTRACT ─▶ 1 SEQUENCE ─▶ 2 EXECUTE ─▶ 3 PROVE ─▶ 4 AUDIT ─▶ 5 FIX ─┐
                              ▲                        │             │
                              └────────────────────────┴─── until 2 clean audits
                                                                      │
                                                              6 REPORT ◀┘
```

---

## Phase 0 — EXTRACT

**Read the approved plan from disk.** Not from your memory of the conversation, not from a
summary. Open the actual file. If the plan lives only in chat messages, write it to a file
first — an unwritten plan cannot be audited.

Then extract **every commitment** into a ledger file (`PLAN-LEDGER.md`, next to the plan).

What counts as a commitment:
- every numbered step and every phase
- **every table row** — tables are where plans hide the most work
- every bullet, including sub-bullets
- **every commitment buried in prose.** A sentence like "all tweens freeze under
  reduced-motion" is a requirement, not atmosphere. This is the single most-skipped category.
- every number and budget ("under 18 KB", "60fps", "zero added bytes")
- every "what we will NOT do" item — these are commitments too, and they are violated by
  *adding* things
- **every request the user made after the plan was approved.** Log these in an ADDENDUM
  block with the user's own words quoted. Late requests are forgotten more often than
  planned ones because they were never in the document.

Rules of extraction:
- **Over-extract.** If you are unsure whether a sentence is a commitment, it is one.
- Quote the plan verbatim in the commitment column. Paraphrasing is how requirements drift.
- Every row gets an **acceptance test written before execution** — the specific check that
  will decide the row, and the tool that will run it. If you cannot write the acceptance
  test, you do not yet understand the row; go read the plan again.
- Never merge two commitments into one row to shorten the ledger.

Finish Phase 0 by stating the count: **"N commitments extracted."** That number is the
contract. The final report must account for all N.

> The ledger is a file, not a mental list, for a concrete reason: if your context is
> summarized mid-execution, the ledger is the only thing that survives intact.

---

## Phase 1 — SEQUENCE

Order rows by real dependency and record it. Do not reorder because something is easier or
more interesting. Mark rows that can run concurrently — then actually run them concurrently.

If the plan states an order, that order wins.

---

## Phase 2 — EXECUTE without stopping

Run the ledger top to bottom. Update each row's status in the file as you go
(`todo → wip → done`). The ledger is edited during the work, not reconstructed after it.

### The no-stop rule

**Do not stop to ask permission, to confirm progress, or to check whether to continue.**
Do not end a turn in the middle of the plan. Do not ask "should I proceed to P4?".

Stop **only** for:

| Stop-worthy | Not stop-worthy |
|---|---|
| An irreversible or outward-facing action not authorized by the plan (publishing, sending, deleting, paying) | A naming choice, a colour, a file layout, a library pick |
| A required credential or secret that does not exist | An ambiguity that has a sensible default |
| An external human gate the plan itself defines | A step that turned out harder than expected |
| A step is impossible **and** every remaining step depends on it | A step is impossible and other steps do not depend on it — do those, log the gap |

For everything in the right column: **decide, log the decision in the row's ASSUMPTION
field, and keep going.** Accumulate non-blocking questions in a list and deliver them at
the end, with the finished work — not instead of it.

### Scope discipline

Full execution means **the plan, entirely, and nothing else**. Thoroughness is not licence
for extra features. If you find something worth doing that is outside the plan, log it as a
suggestion in the report; do not build it.

---

## Phase 3 — PROVE, per step

A row flips to `done` only when an artifact exists that a skeptic could inspect.

| Claim type | Acceptable proof | Not proof |
|---|---|---|
| Visual / layout | Screenshot at each viewport the plan names | "It looks right" |
| Behaviour | Recorded run: driven interaction, command output, test result | "The handler is wired up" |
| Number / budget | The measured value **and** the tool that measured it | An estimate, a guess, a calculation from source |
| Absence of a problem | The audit report showing zero | "I did not see any errors" |
| Content written | The file path, plus a read-back of the part that matters | "I created the file" |

Record the proof path in the ledger row. Then run the gate:

```bash
node "<resolved-skill-directory>/ledger-check.mjs" PLAN-LEDGER.md
```

Resolve `<resolved-skill-directory>` to the actual directory from which this skill was
loaded. Do not pass the placeholder literally or assume a particular agent's home path.
Node.js 18 or newer is required for the checker. If Node is unavailable, record the
mechanical gate as unverified; do not claim it passed. The final gate covers the whole
ledger. Use `--phase <label>` only for a real phase label in the plan's ledger.

It fails if any row is marked done without a proof, or with a proof path that does not
exist on disk. Marking a row done without proof is the exact behaviour this skill exists to
make impossible — do not work around the gate by writing a fake path.

**Banned as evidence, always:** "should work", "presumably", "I believe", "looks fine",
"straightforward so no test needed".

---

## Phase 4 — AUDIT

Read `AUDIT-PROTOCOL.md` and run it in full. Summary of what it demands:

- Re-read the **plan file from disk**, line by line. Your memory of what you built is
  inadmissible here — the audit's whole purpose is to find what you forgot, and you cannot
  remember what you forgot.
- Give every one of the N commitments exactly one verdict: `CONFIRMED` / `UNPROVEN` /
  `MISSING`. No fourth option, no "partial" — partial is `MISSING`.
- Run the four sweeps that a linear pass cannot catch: **prose**, **modifier**, **negative**,
  **addendum**.
- Prefer verifying by a **different method** than the one used while building. If you built
  it and eyeballed it, now measure it.
- Anything not `CONFIRMED` is a defect. Severity is irrelevant to that classification.

Run this pass as a genuinely separate act of work — not as a victory lap over the code you
just wrote.

---

## Phase 5 — FIX LOOP

Every non-`CONFIRMED` item returns through Phase 2 and Phase 3.

Then **re-run the entire audit, not only the fixed rows.** Fixes break neighbours; a
targeted re-check is how a regression ships.

Loop until **two consecutive full audits come back with every row CONFIRMED and no new
defects**. One clean audit is not enough — the first clean pass is frequently the pass that
was not looking hard enough.

Hard cap: 4 rounds. If round 4 still finds defects, stop looping and report honestly with
the remaining defects named. Repeated failure at the same row is evidence of a problem in
the plan or the spec, not something to grind on in silence.

---

## Phase 6 — REPORT

Written for the user, in the user's language. Structure:

1. **Outcome, one line.** What now exists that did not before.
2. **The count.** "N/N commitments confirmed" — the same N from Phase 0. If it is not N/N,
   say so in this line, not further down.
3. **The audit table** — commitment → verdict → evidence path. Collapse to a per-phase
   summary if it is very long, but keep every non-`CONFIRMED` row in full.
4. **What was NOT done, and why.** Mandatory section. "Nothing" is a valid value only when
   it is true. A gap named by you costs a sentence; a gap the user finds costs your
   credibility on everything else in the report.
5. **Assumptions logged during execution** — every decision you made instead of asking.
6. **Batched questions** — the non-blocking ones you deferred.
7. **Out-of-scope suggestions** — things you noticed and deliberately did not build.

Forbidden in the report: "everything works" without the table behind it; a completion claim
for any row whose verdict is not `CONFIRMED`; omitting a gap because it is small.

---

## Anti-patterns

1. **Declaring done at 80%** because the rest is tedious. The tedious part is usually the
   part the user asked for.
2. **Treating prose as flavour.** "Clean glassmorphism" and "buttons in a neat grid" are
   requirements with acceptance tests, exactly like "60fps".
3. **Verifying the happy path only.** The plan's edge cases are commitments.
4. **Wrong instrument.** A screenshot does not prove performance. A passing build does not
   prove behaviour. Reading code does not prove it runs.
5. **Silent substitution.** Building something cheaper than specified and not saying so.
6. **"I will handle it in a follow-up."** There is no follow-up. There is this plan.
7. **Auditing from memory** instead of from the plan file.
8. **Auditing only what you remember building.** The forgotten item leaves no memory trace
   to audit — only the plan file knows it was promised.
9. **Scope creep dressed as thoroughness.** Extra features are a deviation, not a bonus.
10. **Stopping to ask a question that has an obvious default.**
11. **Ledger written after the fact** to match what was built. That is bookkeeping, not
    execution.

---

## Standalone use and optional companion skills

This package is self-contained. No other skill, plugin, API key, or paid service is
required. The user must explicitly approve the plan before execution begins. Approval
may already exist in the conversation; do not ask for it again.

If installed and appropriate, optional companions can help: `plan-loop` for planning
and approval, a design skill for a website, `fable-gate` for deliverable scoring, and
`fable-debug` for diagnosis. Their absence must not prevent executing an approved plan.
When a plan declares a commitment count, compare it with Phase 0 extraction and resolve
any discrepancy before executing.

Typical requests: `$plan-exec`, `/plan-exec` where supported, "execute the approved plan
fully", "בצע את התכנית במלואה", "תבצע הכל ואל תעצור", "אל תדלג על שום שלב".
Use the host agent's supported skill invocation syntax.
