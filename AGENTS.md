# Installing this skill repository

When a user asks to install this repository, read README.md and install only
`skills/plan-exec` for the agent the user is currently using. A URL supplied for
review or reference is not an installation request.

For Codex, prefer its built-in skill-installer when available:
repository `ofeklevy11/plan-exec`, path `skills/plan-exec`.
Otherwise use the documented Skills CLI command for the current agent.

Verify the installed directory contains SKILL.md, AUDIT-PROTOCOL.md,
LEDGER-TEMPLATE.md, ledger-check.mjs, and agents/openai.yaml.
Do not silently replace a conflicting skill, install into unrelated agents,
or execute a project plan as part of installation. Report missing network,
filesystem permissions, or runtime dependencies accurately.

When editing this repository, preserve the approved-plan requirement,
evidence-backed ledger, authorization boundaries, full audits, two-clean-audit
completion rule, and four-round cap. Keep path examples portable.
