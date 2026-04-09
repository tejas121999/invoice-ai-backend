const { sequelize } = require('./database');

async function tableExists(tableName) {
  const [rows] = await sequelize.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tableName`,
    { replacements: { tableName } },
  );
  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await sequelize.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tableName AND COLUMN_NAME = :columnName`,
    { replacements: { tableName, columnName } },
  );
  return rows.length > 0;
}

/**
 * Adds hybrid JSON columns if the table was created before those fields existed.
 * `sequelize.sync()` does not ALTER existing tables, so this runs idempotently at startup.
 */
async function ensureExtractedInvoiceHybridColumns() {
  const tableName = 'extracted_invoice_data';
  if (!(await tableExists(tableName))) {
    return;
  }

  const mode = String(process.env.DB_JSON_STORAGE || 'json').toLowerCase();
  const jsonType = mode === 'text' ? 'LONGTEXT' : 'JSON';

  const columns = [
    { name: 'extractedFieldsJson', type: jsonType },
    { name: 'confidenceJson', type: jsonType },
    { name: 'reviewedFieldsJson', type: jsonType },
  ];

  for (const col of columns) {
    if (await columnExists(tableName, col.name)) {
      continue;
    }
    await sequelize.query(
      `ALTER TABLE \`${tableName}\` ADD COLUMN \`${col.name}\` ${col.type} NULL`,
    );
    console.log(`[database] Added column ${tableName}.${col.name} (${col.type})`);
  }
}

module.exports = { ensureExtractedInvoiceHybridColumns };
