const { sequelize } = require('../config/database');
const defineUser = require('./user.model');
const defineInvoice = require('./invoice.model');
const defineExtractedInvoiceData = require('./extracted-invoice-data.model');
const defineAuditLog = require('./audit-log.model');
const defineInvoiceLineItem = require('./invoice-line-item.model');

const User = defineUser(sequelize);
const Invoice = defineInvoice(sequelize);
const ExtractedInvoiceData = defineExtractedInvoiceData(sequelize);
const AuditLog = defineAuditLog(sequelize);
const InvoiceLineItem = defineInvoiceLineItem(sequelize);

User.hasMany(Invoice, { foreignKey: 'uploadedBy', as: 'uploadedInvoices' });
Invoice.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

Invoice.hasOne(ExtractedInvoiceData, { foreignKey: 'invoiceId', as: 'extractedData' });
ExtractedInvoiceData.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

Invoice.hasMany(AuditLog, { foreignKey: 'invoiceId', as: 'auditLogs' });
AuditLog.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

Invoice.hasMany(InvoiceLineItem, { foreignKey: 'invoiceId', as: 'lineItems' });
InvoiceLineItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

async function syncDatabase() {
  await sequelize.sync();
  console.log('[database] Tables synchronized (sequelize.sync, no force).');
}

module.exports = {
  sequelize,
  User,
  Invoice,
  ExtractedInvoiceData,
  AuditLog,
  InvoiceLineItem,
  syncDatabase,
};
