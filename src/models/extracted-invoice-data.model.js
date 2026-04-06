const { DataTypes } = require('sequelize');

function getJsonColumnType() {
  const mode = String(process.env.DB_JSON_STORAGE || 'json').toLowerCase();
  return mode === 'text' ? DataTypes.TEXT('long') : DataTypes.JSON;
}

function normalizeJsonValue(value) {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      return null;
    }
  }
  return value;
}

function toStorageJson(value) {
  const type = getJsonColumnType();
  const normalized = normalizeJsonValue(value);
  if (normalized == null) {
    return null;
  }
  if (type === DataTypes.JSON) {
    return normalized;
  }
  return JSON.stringify(normalized);
}

function getJsonAttributeDefinition(fieldName) {
  return {
    type: getJsonColumnType(),
    allowNull: true,
    get() {
      return normalizeJsonValue(this.getDataValue(fieldName));
    },
    set(value) {
      this.setDataValue(fieldName, toStorageJson(value));
    },
  };
}

module.exports = (sequelize) => {
  const ExtractedInvoiceData = sequelize.define(
    'ExtractedInvoiceData',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      invoiceId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: {
          model: 'invoices',
          key: 'id',
        },
      },
      invoiceNumber: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      vendorName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      invoiceDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      subtotal: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: true,
      },
      taxAmount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: true,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING(8),
        allowNull: true,
      },
      extractedFieldsJson: getJsonAttributeDefinition('extractedFieldsJson'),
      confidenceJson: getJsonAttributeDefinition('confidenceJson'),
      reviewedFieldsJson: getJsonAttributeDefinition('reviewedFieldsJson'),
      isReviewed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      reviewedBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      tableName: 'extracted_invoice_data',
      timestamps: true,
      underscored: false,
    },
  );

  return ExtractedInvoiceData;
};
