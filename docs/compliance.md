# Purchasing evidence checks

Checked 7 October 2026. This installation defaults to a conservative NZ record-retention rule. It is a record checker, not tax filing, legal certification or payment authorisation. Australian businesses must configure their actual retention policy before real use.

## NZ-RECORD-01: retain expense evidence

[Inland Revenue record keeping](https://www.ird.govt.nz/managing-my-tax/record-keeping) says to keep cash and non-cash expense records for at least seven tax years, in English or Maori unless otherwise approved. Offshore storage requires approval for the business or provider. The [Tax Administration Act 1994, section 22](https://www.legislation.govt.nz/act/public/1994/0166/latest/DLM348436.html) sets the underlying record requirements.

The invoice command requires the actual tax-year end and sets retain_until to at least seven years later. The database rejects a shorter date. /compliance flags missing invoice evidence references. Store the actual document in your controlled archive; a link alone is not evidence that a file exists, remains accessible, or contains correct taxable supply information. Retain originals, attachments, accounting records and recoverable backups. This software does not inspect files, confirm offshore approval, verify language or calculate tax.

## Internal controls, not statutory rules

- POLICY-APPROVAL: imported orders stay draft until a local review. The requester cannot be the recorded approver. The actor is an operator-supplied name, not an authenticated identity. Shared access requires real authentication and role enforcement in your managed installation.
- POLICY-SUPPLIER: flag a review date in the past. The review interval is your policy, not a statutory deadline.
- POLICY-RECEIPT: flag receipts without evidence references. Receipts cannot exceed ordered quantities through the CLI.
- POLICY-MATCH: flag invoice unit-price differences, invoiced quantities above receipts, and invoicing above ordered quantities. Comparison is exact at stored precision, without tax, freight, discounts or exchange conversions. It is an exception report; a supplier invoice is recorded even when it differs.
- Budget controls: approval locks the budget record and checks existing approved and closed commitments. Draft requests are shown separately. Cancellation releases an unused commitment; closing retains it. No payment or tax return can be made here.

No command deletes records. Activity logs preserve operator-entered actions but are not tamper-proof. Database administrators can change records; apply database permissions and backups independently. Credit notes, returns, invoice corrections and multi-stage delegated approvals need an explicit extension with an audit trail before use. Do not erase a mismatch to make it disappear.
