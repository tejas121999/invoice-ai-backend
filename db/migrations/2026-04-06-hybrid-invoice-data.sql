-- Hybrid invoice data migration (safe, non-destructive)
-- Run against the same schema configured in DB_NAME.
-- This script preserves existing rows and only adds new structures.

ALTER TABLE extracted_invoice_data
  ADD COLUMN IF NOT EXISTS extractedFieldsJson JSON NULL,
  ADD COLUMN IF NOT EXISTS confidenceJson JSON NULL,
  ADD COLUMN IF NOT EXISTS reviewedFieldsJson JSON NULL;

-- Optional backfill from legacy reviewedData (if present)
-- Keeps existing reviewed edits available in the new column.
UPDATE extracted_invoice_data
SET reviewedFieldsJson = reviewedData
WHERE reviewedFieldsJson IS NULL
  AND reviewedData IS NOT NULL;

-- Optional line-item table for normalized item rows.
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoiceId INT UNSIGNED NOT NULL,
  lineNumber INT UNSIGNED NULL,
  description VARCHAR(500) NULL,
  quantity DECIMAL(14,3) NULL,
  unitPrice DECIMAL(14,2) NULL,
  taxAmount DECIMAL(14,2) NULL,
  totalAmount DECIMAL(14,2) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_invoice_line_items_invoice_id (invoiceId),
  INDEX idx_invoice_line_items_invoice_line (invoiceId, lineNumber),
  CONSTRAINT fk_invoice_line_items_invoice
    FOREIGN KEY (invoiceId) REFERENCES invoices(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
