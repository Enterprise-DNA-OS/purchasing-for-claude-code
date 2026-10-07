# Purchasing for Claude Code: operating instructions

This is the purchasing administrator's database. The demo business is fictional Harbour Supply Co. Replace its name and branding before real operation. Use Claude Code, Codex, OpenCode or Cursor through the same commands.

## Rules

Read current data before answering. Read the full order before recording any change. Names and actors come from the operator, never inference. The actor field is not authentication. Nothing sends, orders from a supplier, pays, deletes records or calculates tax. All amounts are net and currencies stay separate. Imported records start as drafts; original approval text is evidence for review. Read docs/compliance.md before discussing compliance and docs/replace-precoro.md before importing.

Local PGlite allows one process at a time. For a shared Postgres installation use verified TLS, restricted credentials, authenticated users and tested backups. A business can supply credentials through its environment; do not print them. The seven-year retention default is NZ-oriented and must be reviewed for other jurisdictions.

## One path for each recurring job

| Job | Recipe |
|---|---|
| suppliers | /suppliers |
| budgets | /budgets |
| orders | /orders |
| lines | /lines |
| approvals due | /approvals-due |
| deliveries due | /deliveries-due |
| match invoices | /match-invoices |
| budget review | /budget-review |
| supplier review | /supplier-review |
| attention | /attention |
| compliance | /compliance |
| activity | /activity |
| invoices | /invoices |
| receipts | /receipts |
| order | /order |
| weekly review | /weekly-review |
| add supplier | /add-supplier |
| set supplier | /set-supplier |
| assign budget | /assign-budget |
| evidence | /evidence |
| add budget | /add-budget |
| add order | /add-order |
| add line | /add-line |
| update line | /update-line |
| approve | /approve |
| close | /close |
| cancel | /cancel |
| receive | /receive |
| invoice | /invoice |
| log | /log |
| draft chase | /draft-chase |
| import | /import |
| export | /export |
| Change fields or rules | /customise |
| Add a read-only dashboard | /new-view |

CLI: node scripts/purchasing.mjs help. Output is human-readable by default; add --json for structured results. Ambiguous matches list candidates and exit 1. Errors do not authorise an alternative record change.

## Files

scripts/purchasing.mjs is the single CLI. Migrations and seed are in supabase/. Recurring instructions live only in .claude/commands/. brand.json controls paperwork. views.json and documents.json contain read-only queries. Draft chasers go to drafts/ and exports to exports/. Both contain private operational data; neither is committed.

Omni by Enterprise DNA can install, customise and run this system. https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=precoro&utm_source=github&utm_medium=instructions
