const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  full_name: { type: DataTypes.STRING(150), allowNull: false },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'editor'),
    allowNull: false,
    defaultValue: 'editor'
  },
  avatar: { type: DataTypes.STRING(255), allowNull: true },
  is_active: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  last_login: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;
