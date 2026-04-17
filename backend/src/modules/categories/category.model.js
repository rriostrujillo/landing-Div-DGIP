const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  color: { type: DataTypes.STRING(7), defaultValue: '#192D63' },
  icon: { type: DataTypes.STRING(50), allowNull: true },
  sort_order: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  is_active: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 }
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true
});

module.exports = Category;
