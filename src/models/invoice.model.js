const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define(
    'Invoice',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      fileName: {
        type: DataTypes.STRING(512),
        allowNull: false,
      },
      filePath: {
        type: DataTypes.STRING(1024),
        allowNull: false,
      },
      fileType: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      uploadStatus: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      processingStatus: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      uploadedBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      uploadedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rawText: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
    },
    {
      tableName: 'invoices',
      timestamps: true,
      underscored: false,
    },
  );

  return Invoice;
};
