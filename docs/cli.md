# CLI guide

Run node scripts/purchasing.mjs COMMAND. Add --json to any command for structured results. Options accept --key=value or --key value. Unknown options fail. Dates are YYYY-MM-DD, prices have at most two decimal places, quantities three. Values must be positive except unit prices, which may be zero. Records match exact names first, then case-insensitive name fragments or ID prefixes. Ambiguous results list candidates and exit 1.

## Commands

### suppliers

`node scripts/purchasing.mjs suppliers`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### budgets

`node scripts/purchasing.mjs budgets`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### orders

`node scripts/purchasing.mjs orders`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### lines

`node scripts/purchasing.mjs lines`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### approvals-due

`node scripts/purchasing.mjs approvals-due`

Show requests waiting for review with the requester, value and due date. Approval is a separate, explicit record change.

### deliveries-due

`node scripts/purchasing.mjs deliveries-due`

Show approved outstanding items due within the next seven days, including overdue deliveries. Do not treat receipt value as invoice value.

### match-invoices

`node scripts/purchasing.mjs match-invoices`

Explain unit-price differences and invoicing ahead of receipts. All amounts are net. A clean match is not permission to pay.

### budget-review

`node scripts/purchasing.mjs budget-review`

Show approved and closed commitments, draft requests and remaining budget separately by currency. Never add currencies together.

### supplier-review

`node scripts/purchasing.mjs supplier-review`

Show commitments and late orders by supplier and currency. Compare review dates to today.

### attention

`node scripts/purchasing.mjs attention`

Prioritise draft approvals, invoice mismatches, overdue deliveries and open orders without activity for fourteen days.

### compliance

`node scripts/purchasing.mjs compliance`

Read docs/compliance.md. Separate Inland Revenue evidence requirements from internal policy. Report missing records without certifying legal compliance.

### activity

`node scripts/purchasing.mjs activity`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### invoices

`node scripts/purchasing.mjs invoices`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### receipts

`node scripts/purchasing.mjs receipts`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### order

`node scripts/purchasing.mjs order --order=PO-1001`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### weekly-review

`node scripts/purchasing.mjs weekly-review`

Run attention, budget-review and match-invoices, or use the weekly-review command that combines these three reads. Write a Monday brief with decisions, owners and outstanding evidence. Never approve or send anything as part of the review.

### add-supplier

`node scripts/purchasing.mjs add-supplier --name="Supplier" --contact="Contact" --evidence="archive reference" --review-due=2027-01-01`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### set-supplier

`node scripts/purchasing.mjs set-supplier --supplier="Supplier" --contact="Contact" --evidence="archive reference" --review-due=2027-01-01`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### assign-budget

`node scripts/purchasing.mjs assign-budget --order=PO-2001 --budget="Department period" --actor="Reviewer"`

Only draft orders can change budget. Select a budget in the same currency and period. Imported orders without a mapped budget need this before approval.

### evidence

`node scripts/purchasing.mjs evidence --order=PO-2001 --line=1 --reference=INV-2001 --kind=invoice --evidence="archive reference" --actor="Reviewer"`

Attach the controlled archive reference for an existing receipt or invoice line. Verify the actual file is accessible; this command stores a reference only.

### add-budget

`node scripts/purchasing.mjs add-budget --name="Department period" --currency=NZD --start=2026-01-01 --end=2026-12-31 --limit=20000`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### add-order

`node scripts/purchasing.mjs add-order --reference=PO-2001 --supplier="Supplier" --budget="Department period" --title="Goods required" --requester="Name" --currency=NZD --ordered-on=2026-10-07 --due=2026-10-21`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### add-line

`node scripts/purchasing.mjs add-line --order=PO-2001 --line=1 --description="Item" --quantity=10 --unit-price=12.50`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### update-line

`node scripts/purchasing.mjs update-line --order=PO-2001 --line=1 --quantity=10 --unit-price=12.50`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### approve

`node scripts/purchasing.mjs approve --order=PO-2001 --actor="Approver"`

Read the full order and budget first. Record only an actual operator-authorised approval. The requester cannot approve their own order. The actor name is a record, not authentication.

### close

`node scripts/purchasing.mjs close --order=PO-2001 --actor="Reviewer"`

Close only fully received orders whose invoiced quantities and unit prices match. Closed orders retain their budget commitment.

### cancel

`node scripts/purchasing.mjs cancel --order=PO-2001 --actor="Reviewer"`

Confirm the intended cancellation. Only open orders with no receipts or invoices can cancel. Records remain in the database.

### receive

`node scripts/purchasing.mjs receive --order=PO-2001 --line=1 --reference=GR-2001 --quantity=5 --date=2026-10-08 --evidence="archive reference" --actor="Receiver"`

Use the delivery note as evidence. Partial receipts accumulate. A repeat reference fails and over-receipts are rejected. No physical delivery is inferred.

### invoice

`node scripts/purchasing.mjs invoice --order=PO-2001 --line=1 --reference=INV-2001 --quantity=5 --unit-price=12.50 --issued=2026-10-08 --due=2026-11-08 --year-end=2027-03-31 --evidence="archive reference" --actor="Reviewer"`

Record a supplier invoice line even if it differs from the order. Use the actual tax-year end. Invoice numbers may span multiple item lines. This records evidence and does not pay or calculate tax.

### log

`node scripts/purchasing.mjs log --order=PO-2001 --actor="Name" --note="What happened"`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

### draft-chase

`node scripts/purchasing.mjs draft-chase --order=PO-1001`

Read order history first. Produce a draft in drafts/, show it to the operator and remove internal context before any human sends it. Nothing sends from this repo.

### import

`node scripts/purchasing.mjs import precoro --file=/path/purchase-orders.xlsx --dry-run`

Read docs/replace-precoro.md first. Test the whole file with --dry-run, compare counts and currency totals, then remove --dry-run for the requested import. Source approval statuses never grant local approval.

### export

`node scripts/purchasing.mjs export --out=/path/new-backup.json`

Write a new backup path. Existing files are never overwritten. Protect supplier and employee information. This is not a restore command.

### help

`node scripts/purchasing.mjs help`

Reads or updates the named records. For mutations, use values from the operator and inspect the affected record first.

## Calculations and boundaries

Order totals sum rounded quantity times net unit price for each line. Received value uses the order price; invoice value uses the recorded invoice price. Receipt and invoice totals are aggregated separately before joining, preventing multiplication when a line has several receipts and invoices. Unit-price matching is exact. Taxes, discounts, freight, credit notes, returns, payments and currency conversion are outside the base.

Budgets cover a recorded date interval and currency. Approved and closed orders consume the full commitment; drafts are separate requests. Approval locks the budget and order in a transaction before testing available funds. Cancellation is blocked once receipt or invoice evidence exists. Closing needs full receipts, full invoicing and matching unit prices. The compliance report flags missing evidence links but does not inspect their content.

Imports are atomic. Identical repeats do nothing; changed source rows require review. A report line must have a stable item reference. The import accepts first-sheet plain-value XLSX or UTF-8 CSV and preserves original columns. Local records and imported records cannot silently overwrite each other. See the replace guide.

The export is a consistent read-only snapshot across all seven data sets, including audit notes and original imported rows. Document attachments are stored separately. No delete or send command exists. To correct a recorded receipt or invoice, add a reviewed reversal design and tests through /customise before changing history.
