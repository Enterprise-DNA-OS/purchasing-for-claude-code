---
description: "Budget review for the purchasing records"
---

# /budget-review

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs budget-review 
```

Show approved and closed commitments, draft requests and remaining budget separately by currency. Never add currencies together.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
