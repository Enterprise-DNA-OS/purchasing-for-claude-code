---
description: "Attention for the purchasing records"
---

# /attention

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs attention 
```

Prioritise draft approvals, invoice mismatches, overdue deliveries and open orders without activity for fourteen days.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
