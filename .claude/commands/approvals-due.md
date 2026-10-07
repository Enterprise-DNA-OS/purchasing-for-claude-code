---
description: "Approvals due for the purchasing records"
---

# /approvals-due

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs approvals-due 
```

Show requests waiting for review with the requester, value and due date. Approval is a separate, explicit record change.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
