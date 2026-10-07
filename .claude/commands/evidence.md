---
description: "Evidence for the purchasing records"
---

# /evidence

Read CLAUDE.md, then run:

```bash
node scripts/purchasing.mjs evidence --order=PO-2001 --line=1 --reference=INV-2001 --kind=invoice --evidence="archive reference" --actor="Reviewer"
```

Attach the controlled archive reference for an existing receipt or invoice line. Verify the actual file is accessible; this command stores a reference only.

Use --json for structured results. Partial IDs and case-insensitive record names work. If ambiguous, show the listed candidates and ask which one. Keep currency labels. Never invent source evidence, send a message or make a payment. See docs/cli.md for argument rules.
