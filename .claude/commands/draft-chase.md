---
description: "Draft chase for the purchasing records"
---

# /draft-chase

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs draft-chase --order=PO-1001
```

Read order history first. Produce a draft in drafts/, show it to the operator and remove internal context before any human sends it. Nothing sends from this repo.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
