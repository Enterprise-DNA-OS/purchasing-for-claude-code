---
description: "Weekly review for the purchasing records"
---

# /weekly-review

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs weekly-review 
```

Run attention, budget-review and match-invoices, or use the weekly-review command that combines these three reads. Write a Monday brief with decisions, owners and outstanding evidence. Never approve or send anything as part of the review.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
