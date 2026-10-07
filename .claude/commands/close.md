---
description: "Close for the purchasing records"
---

# /close

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs close --order=PO-2001 --actor="Reviewer"
```

Close only fully received orders whose invoiced quantities and unit prices match. Closed orders retain their budget commitment.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
