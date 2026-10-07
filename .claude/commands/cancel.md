---
description: "Cancel for the purchasing records"
---

# /cancel

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs cancel --order=PO-2001 --actor="Reviewer"
```

Confirm the intended cancellation. Only open orders with no receipts or invoices can cancel. Records remain in the database.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
