---
description: "Add budget for the purchasing records"
---

# /add-budget

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs add-budget --name="Department period" --currency=NZD --start=2026-01-01 --end=2026-12-31 --limit=20000
```

Use current records. For a change, replace example values with facts the operator supplied and read the affected record first. Present the resulting record or list.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
