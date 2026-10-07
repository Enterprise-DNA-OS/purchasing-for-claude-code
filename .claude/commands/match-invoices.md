---
description: "Match invoices for the purchasing records"
---

# /match-invoices

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs match-invoices 
```

Explain unit-price differences and invoicing ahead of receipts. All amounts are net. A clean match is not permission to pay.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
