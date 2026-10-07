---
description: "Invoice for the purchasing records"
---

# /invoice

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs invoice --order=PO-2001 --line=1 --reference=INV-2001 --quantity=5 --unit-price=12.50 --issued=2026-10-08 --due=2026-11-08 --year-end=2027-03-31 --evidence="archive reference" --actor="Reviewer"
```

Record a supplier invoice line even if it differs from the order. Use the actual tax-year end. Invoice numbers may span multiple item lines. This records evidence and does not pay or calculate tax.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
