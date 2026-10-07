---
description: "Import for the purchasing records"
---

# /import

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs import precoro --file=/path/purchase-orders.xlsx --dry-run
```

Read docs/replace-precoro.md first. Test the whole file with --dry-run, compare counts and currency totals, then remove --dry-run for the requested import. Source approval statuses never grant local approval.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
