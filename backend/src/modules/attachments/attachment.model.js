const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Attachment = sequelize.define('Attachment', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  post_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  media_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  sort_order: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 }
}, {
  tableName: 'attachments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Attachment;
