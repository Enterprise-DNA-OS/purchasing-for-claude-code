---
description: "Deliveries due for the purchasing records"
---

# /deliveries-due

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs deliveries-due 
```

Show approved outstanding items due within the next seven days, including overdue deliveries. Do not treat receipt value as invoice value.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
