---
description: "Receive for the purchasing records"
---

# /receive

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs receive --order=PO-2001 --line=1 --reference=GR-2001 --quantity=5 --date=2026-10-08 --evidence="archive reference" --actor="Receiver"
```

Use the delivery note as evidence. Partial receipts accumulate. A repeat reference fails and over-receipts are rejected. No physical delivery is inferred.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
