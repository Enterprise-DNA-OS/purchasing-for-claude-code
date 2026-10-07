---
description: "Add order for the purchasing records"
---

# /add-order

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs add-order --reference=PO-2001 --supplier="Supplier" --budget="Department period" --title="Goods required" --requester="Name" --currency=NZD --ordered-on=2026-10-07 --due=2026-10-21
```

Use current records. For a change, replace example values with facts the operator supplied and read the affected record first. Present the resulting record or list.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
