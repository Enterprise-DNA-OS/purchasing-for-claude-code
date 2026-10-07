# Purchasing for Claude Code

Your purchase orders, receipts, invoice differences and budget commitments in a database you own. Free MIT-licensed software for purchasing administrators. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Clone, try the demo and import purchasing records. | Your fields, approval rules, Precoro data, web front end or different stack. | Installed, connected and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=precoro&utm_source=github&utm_medium=customise) | [Book a call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=precoro&utm_source=github&utm_medium=managed) |

## What the purchasing team does each week

Review approvals, chase late deliveries, match invoice lines, check budget headroom and collect missing evidence. The fictional Harbour Supply Co demo includes partially received cartons, an invoice with a different unit price, an overdue supplier review, missing receipt evidence and a draft approval. NZD and AUD budgets remain separate. Seed dates move with the first demo run; reseeding does not reset records.

## Quick start

Node 20 or later, on Windows or Linux:

```bash
git clone https://github.com/Enterprise-DNA-OS/purchasing-for-claude-code.git
cd purchasing-for-claude-code
npm install
npm run demo
npm test
npm run view
npm run docs
```

PGlite stores records in .data/db with no server install. DATABASE_URL selects shared Postgres with verified TLS. Use a new DATA_DIR and npm run migrate without seed for real imports. Never mix sample records with purchasing records. Local operation uses one process; shared operation needs user authentication, role controls, restricted database access and tested backups. Names recorded as actors are not authenticated identities.

## 34 CLI commands and 35 slash recipes

/suppliers, /budgets, /orders, /lines, /approvals-due, /deliveries-due, /match-invoices, /budget-review, /supplier-review, /attention, /compliance, /activity, /invoices, /receipts, /order, /weekly-review, /add-supplier, /set-supplier, /assign-budget, /evidence, /add-budget, /add-order, /add-line, /update-line, /approve, /close, /cancel, /receive, /invoice, /log, /draft-chase, /import, /export, /customise and /new-view. The CLI also includes help. See [the command guide](docs/cli.md) for arguments and calculations. Human output is the default; --json is available for every command. Partial IDs and case-insensitive names work, with an error and candidate list when ambiguous.

## Ten questions beyond a fixed dashboard

Precoro also offers custom reports. These are working questions this free version answers today, with queries you can change to fit your process. They are not claims about what Precoro cannot report.

- Which orders combine late deliveries and invoice differences? `attention`
- How much budget remains after approved orders, by currency? `budget-review`
- Which draft requests would consume that remaining budget? `approvals-due`
- Which suppliers have overdue reviews and open commitments? `supplier-review`
- Which invoice quantities run ahead of goods received? `match-invoices`
- Which invoice unit prices differ from the agreed order price? `match-invoices`
- What is due this week after partial receipts? `deliveries-due`
- Which invoices lack a reference to the original evidence? `compliance`
- Who recorded each action on an order, and what did they note? `order --order=PO-1001`
- Which open orders have gone quiet for fourteen days? `attention`

## Your first hour: ten things to ask for

1. Put our business name, logo and colours on the purchasing paperwork.
2. Show the approval queue with delivery deadlines.
3. Show late items after partial receipts.
4. Compare invoice prices with order prices.
5. Separate NZD and AUD budget commitments.
6. Draft a supplier delivery chaser from the order history.
7. Test an import of our Precoro purchase-order report.
8. Map imported orders to our actual budget periods.
9. Add our cost centre field through a new migration.
10. Create a read-only view for the Monday purchasing meeting.

## Paperwork and controls

Change brand.json once. npm run docs produces draft purchase orders, goods receipt records and invoice matching reports as branded HTML. npm run view produces weekly and exception snapshots. Files stay on your machine; nothing sends or pays. Protect rendered files as operational data.

[Compliance checks](docs/compliance.md) cite Inland Revenue and distinguish evidence retention from internal approval policies. The base does not calculate tax, issue compliant tax invoices, authenticate an approver or inspect source documents. [Why no front end](docs/why-no-front-end.md) covers mobile receiving, staff self-service and accounting connections.

[Move from Precoro](docs/replace-precoro.md): one command imports supported purchase-order report rows from XLSX or CSV with explicit column mapping. An identical repeat creates no duplicates; changed source rows require review. Approvals, receipts, invoices, attachments and payments do not arrive through the purchase-order import. Review their separate migration before switching.

## Verification

npm test uses a temporary database and exercises all 34 commands, seed idempotence, budget and approval controls, partial receipts, invoice matching, evidence retention, repeat imports, rollback, CSV and XLSX, escaped HTML, drafts and exports. TEST_DATABASE_URL enables the same suite against an empty disposable Postgres database. CI covers Windows, Linux and Postgres. Never point tests at a populated database.

The spreadsheet dependency overrides uuid to the compatible patched 11.x line; XLSX read and write are covered in the suite. [Research and scoring](docs/research.md) records pricing evidence and the limits of buyer research.

MIT licence. Not affiliated with Precoro or Anthropic. Hosting and agent usage have separate costs. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=precoro&utm_source=github&utm_medium=readme).
