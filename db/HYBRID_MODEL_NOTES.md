# Hybrid Invoice Data Model Notes

## Updated `extracted_invoice_data` design

Keep these fixed columns for filtering/reporting:

- `id`
- `invoiceId`
- `invoiceNumber`
- `vendorName`
- `invoiceDate`
- `dueDate`
- `subtotal`
- `taxAmount`
- `totalAmount`
- `currency`
- `isReviewed`
- `reviewedBy`
- `createdAt`
- `updatedAt`

Add flexible JSON columns:

- `extractedFieldsJson`: variable extracted fields by document template
- `confidenceJson`: per-field confidence values
- `reviewedFieldsJson`: reviewed/corrected values for dynamic fields

## API response shape (minimal change)

Return common fields directly plus JSON blobs:

```json
{
  "id": 15,
  "invoiceId": 1005,
  "invoiceNumber": "INV-2026-001",
  "vendorName": "Acme Supplies",
  "invoiceDate": "2026-04-01",
  "dueDate": "2026-04-30",
  "subtotal": "1200.00",
  "taxAmount": "216.00",
  "totalAmount": "1416.00",
  "currency": "INR",
  "isReviewed": true,
  "reviewedBy": 2,
  "extractedFieldsJson": {
    "po_number": "PO-1023",
    "gst_number": "27ABCDE1234F1Z5",
    "payment_terms": "Net 30"
  },
  "confidenceJson": {
    "invoice_number": 0.95,
    "vendor_name": 0.88,
    "po_number": 0.72
  },
  "reviewedFieldsJson": {
    "po_number": "PO-2024-001"
  }
}
```

## Notes for MySQL JSON fallback

The Sequelize model supports fallback storage:

- Default: native `JSON` columns.
- Set `DB_JSON_STORAGE=text` to serialize into `TEXT`.

If using text mode at DB level, replace migration JSON columns with:

```sql
ALTER TABLE extracted_invoice_data
  ADD COLUMN IF NOT EXISTS extractedFieldsJson LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS confidenceJson LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS reviewedFieldsJson LONGTEXT NULL;
```

## Line items

Preferred: `invoice_line_items` table for normalized querying.

Temporary MVP alternative: store line items in
`extractedFieldsJson.line_items` as an array.
