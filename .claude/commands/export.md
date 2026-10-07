---
description: "Export for the purchasing records"
---

# /export

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs export --out=/path/new-backup.json
```

Write a new backup path. Existing files are never overwritten. Protect supplier and employee information. This is not a restore command.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
