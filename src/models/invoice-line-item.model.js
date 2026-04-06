const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvoiceLineItem = sequelize.define(
    'InvoiceLineItem',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      invoiceId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'invoices',
          key: 'id',
        },
      },
      lineNumber: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      quantity: {
        type: DataTypes.DECIMAL(14, 3),
        allowNull: true,
      },
      unitPrice: {
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
    },
    {
      tableName: 'invoice_line_items',
      timestamps: true,
      underscored: false,
      indexes: [
        {
          fields: ['invoiceId'],
        },
        {
          fields: ['invoiceId', 'lineNumber'],
        },
      ],
    },
  );

  return InvoiceLineItem;
};
