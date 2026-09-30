# AUDIT-PROTOCOL — the completeness audit

Loaded by `plan-exec` at Phase 4. This is the pass that decides whether the plan was
actually executed. Run it as a separate job with a hostile mindset: **your goal here is to
find the thing you missed, not to confirm the work you remember doing.**

If this pass finds nothing on its first run over a large plan, that is a warning sign about
the pass, not a compliment to the build.

---

## Rule 0 — the plan file is the only source of truth

Open the plan document from disk and read it top to bottom, line by line, before looking at
any code you wrote.

Your memory of the plan is inadmissible. It was formed while you were building, so it is
shaped by what you built — which means it is systematically blind to omissions. **You cannot
remember what you forgot.** Only the file knows.

Same rule for the ledger: read it from disk. If ledger and plan disagree, the plan wins and
the ledger has a bug.

---

## Step 1 — verdict every commitment

Walk the ledger. For each of the N rows, find the evidence and assign exactly one verdict:

| Verdict | Means |
|---|---|
| `CONFIRMED` | Evidence exists, and you checked it **during this audit** — not "I checked it earlier" |
| `UNPROVEN` | The work appears to exist, but nothing here demonstrates it works |
| `MISSING` | Not built, built differently than specified, or built partially |

There is no `partial` and no `mostly`. Partial is `MISSING`. A row built to a lower spec than
the plan states is `MISSING`, not `CONFIRMED with a note`.

For every `UNPROVEN` and `MISSING`, write one sentence of **concrete failure**: what a user
would do, and what would happen. "Not verified" is not a finding; "opening the panel on a
390px viewport was never tested, so the drag-to-close handle may sit under the safe-area
inset" is.

---

## Step 2 — the four sweeps

A row-by-row walk over the ledger only finds what extraction caught. These four sweeps go
back to the plan text to find what extraction missed. Run all four, every round.

### Sweep A — prose
Re-read the plan's paragraphs, ignoring every table and list. Requirements written as
sentences are the most-dropped category, because they do not look like tasks. Collect every
sentence that constrains the build and check it against the artifact.

Typical catches: "all animations freeze under reduced-motion", "no new fonts", "the panel
stays non-modal on desktop", "clean glassmorphism".

### Sweep B — modifiers
Grep the plan for absolute quantifiers and check each one literally:

```
always · never · every · all · only · none · zero · must
under · over · at most · at least · maximum · minimum
```

These are the commitments most often violated by a single exception. "Every tween is
interruptible" fails if one tween is not. Check the *weakest* instance, not a typical one.

### Sweep C — negative space
Find the plan's "what we will NOT do" list — the scope guards, the banned techniques, the
forbidden dependencies. Verify nothing on it was added anyway. This sweep catches violations
that Step 1 structurally cannot see, because Step 1 only looks for things that should exist.

Also check: no new dependency, no new asset, no new global, no new font that the plan did
not authorize.

### Sweep D — addendum
Re-read every user message sent **after** the plan was approved. Extract each request and
check it. These are forgotten more often than planned items, because they were never in the
document being audited.

Quote the user's own words in the audit row. A paraphrase of a late request is how the
request quietly shrinks.

---

## Step 3 — verify by a different instrument

For every row you can, re-verify using a method different from the one used while building.

| Built and checked by | Re-verify with |
|---|---|
| Reading the code | Running it |
| Eyeballing a screenshot | Measuring the computed value |
| A single viewport | The smallest and the largest the plan names |
| A single happy path | The empty case, the error case, the interrupted case |
| Manual click-through | An automated pass over the same route |

Same-instrument re-verification mostly reproduces the original blind spot.

---

## Step 4 — the standing checklist

Independent of any specific plan, check these. They are the recurring defects across
execution runs:

- [ ] Every file the plan said would be created exists, at the path the plan named.
- [ ] Every file the plan said would be **modified** was modified — not shadowed by a new file.
- [ ] Nothing that used to work is now broken. Name the previously-working behaviours you
      re-checked, and re-check the ones the change touched.
- [ ] Every number in the plan was measured, not assumed.
- [ ] Every accessibility, performance and responsive budget in the plan was re-run **after**
      the last code change, not before it.
- [ ] Error and empty states exist wherever the plan implies data can be absent.
- [ ] Nothing was left as a stub, a TODO, a placeholder, or dead code — unless the plan
      explicitly specified a stub.
- [ ] Console is clean at runtime: no errors, no warnings introduced by this work.
- [ ] The user's language, direction and locale conventions hold everywhere new text appears.
- [ ] Cleanup: temporary scripts, debug logging and scratch files are gone or deliberate.

---

## Step 5 — the output

Produce a table. One row per commitment, in plan order, with the ID from the ledger:

```
| ID  | Commitment (verbatim)        | Verdict   | Evidence                    |
|-----|------------------------------|-----------|-----------------------------|
| P3-4| "caret ... נעלם ב-done"      | CONFIRMED | shots/stream-done.png       |
| P6-2| "מתג צליל כבוי כברירת מחדל"  | MISSING   | no toggle in the HUD        |
```

Then three lines:

```
AUDIT ROUND n — N commitments · C confirmed · U unproven · M missing
NEW DEFECTS THIS ROUND: <count>   (defects that the previous round did not report)
VERDICT: CLEAN | DEFECTS FOUND
```

`CLEAN` requires `C == N`. Any other combination is `DEFECTS FOUND`, regardless of severity.

---

## Step 6 — hand back to the fix loop

Every non-`CONFIRMED` row goes back through execution and proof, then the **entire** audit
runs again — all steps, all four sweeps, not just the repaired rows.

Two consecutive `CLEAN` rounds end the loop. Cap at 4 rounds; at round 4 with defects still
open, stop and report them plainly rather than continuing to grind.

---

## The honesty clause

If you cannot verify something, the verdict is `UNPROVEN` and the report says so. Never
upgrade a verdict because the row is small, because the code obviously looks right, or
because a clean report reads better.

A gap you name costs one sentence. A gap the user discovers costs their trust in every other
line of the report.
