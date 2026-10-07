# Move purchasing records from Precoro

The free import covers purchase-order lines from a Precoro custom report. It does not pretend a spreadsheet contains the whole account. [Precoro documents XLSX report export](https://help.precoro.com/how-to-create-a-custom-report), checked 7 October 2026.

1. With Reports and purchase-order access, create a custom Purchase Order report. Select general, supplier and item fields; run it and export in English as XLSX. Use one row per item. Put the header on the first row and plain values on the first worksheet. Remove report titles and totals. An Excel UTF-8 CSV saved from the same report is also accepted.
2. Include a stable purchase-order number, supplier name, creator, document currency, creation date, delivery date, item row number, item description, quantity and net unit price. Preserve leading zeroes in identifiers as text. Use ISO dates (YYYY-MM-DD); real spreadsheet date cells are accepted. If the report omits item row numbers, add stable unique Line # values within each purchase order before importing. Never use an aggregated total as a unit price.
3. Start a separate empty DATA_DIR, run npm run migrate and create your actual budgets. Do not seed real installations. A Budget or Budget Name column can map to an existing budget; otherwise use assign-budget on each imported order after reviewing it.
4. Import in one command:

```bash
npm run purchasing -- import precoro --file=/path/purchase-orders.xlsx --dry-run
npm run purchasing -- import precoro --file=/path/purchase-orders.xlsx
```

The first command validates the complete file and rolls back everything. The second imports it atomically. Run the same import twice without duplicates. Changed source rows and collisions with locally created orders are rejected for review. Unknown columns are kept in source_row. Source statuses are preserved separately and never grant local approval. All new imported orders are drafts. Receipts, invoice lines, approval history, supplier bank details, attachments, taxes, contracts and payment records need separate mapping.

## Field mapping

Default aliases are in scripts/purchasing.mjs under importFields. Custom-report labels vary with selected fields and report language. A JSON mapping points internal field names to your exact column labels:

```json
{"reference":"Document #","supplier":"Supplier Name","requester":"Creator Name","currency":"Currency","ordered_on":"Creation Date","due_on":"Delivery Date","line":"Line #","description":"Item Name","quantity":"Quantity","unit_price":"Price","budget":"Budget"}
```

Pass --map=/path/columns.json. Empty required values, invalid dates, ambiguous date formats, duplicate lines, conflicting order headers, formulas and inconsistent currencies fail the whole import. Fixture files demonstrate the supported report shape; they are synthetic, not a claim that every Precoro account exports the same headings.

## Reconcile before switching

Compare purchase-order counts, line counts and net values by currency to Precoro. Run orders, lines, budget-review and compliance. Review each approval from its evidence. Bring across outstanding receipts and invoice lines through receive and invoice with source references. Compare the delivery position and invoice exceptions to originals. Keep Precoro available until the totals, evidence archive and operating controls are accepted by the owner.

An export command writes all seven record sets and original import rows as a JSON backup. Restore is a reviewed database operation; this export is not an automatic disaster-recovery service. Store document files separately with access controls and test recovery.
