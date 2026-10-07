---
description: "Approve for the purchasing records"
---

# /approve

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs approve --order=PO-2001 --actor="Approver"
```

Read the full order and budget first. Record only an actual operator-authorised approval. The requester cannot approve their own order. The actor name is a record, not authentication.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
