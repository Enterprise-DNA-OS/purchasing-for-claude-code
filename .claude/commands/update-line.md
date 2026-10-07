---
description: "Update line for the purchasing records"
---

# /update-line

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs update-line --order=PO-2001 --line=1 --quantity=10 --unit-price=12.50
```

Use current records. For a change, replace example values with facts the operator supplied and read the affected record first. Present the resulting record or list.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
