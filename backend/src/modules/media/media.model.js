const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Media = sequelize.define('Media', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  filename: { type: DataTypes.STRING(255), allowNull: false },
  original_name: { type: DataTypes.STRING(255), allowNull: false },
  mime_type: { type: DataTypes.STRING(100), allowNull: false },
  size: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 },
  path: { type: DataTypes.STRING(500), allowNull: false },
  thumbnail_path: { type: DataTypes.STRING(500), allowNull: true },
  alt_text: { type: DataTypes.STRING(300), allowNull: true },
  uploaded_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, {
  tableName: 'media',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Media;
