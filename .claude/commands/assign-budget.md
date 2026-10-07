---
description: "Assign budget for the purchasing records"
---

# /assign-budget

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs assign-budget --order=PO-2001 --budget="Department period" --actor="Reviewer"
```

Only draft orders can change budget. Select a budget in the same currency and period. Imported orders without a mapped budget need this before approval.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
