const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(300), allowNull: false },
  slug: { type: DataTypes.STRING(350), allowNull: false, unique: true },
  excerpt: { type: DataTypes.TEXT, allowNull: true },
  content: { type: DataTypes.TEXT('long'), allowNull: false },
  cover_image: { type: DataTypes.STRING(500), allowNull: true },
  category_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  author_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'featured', 'archived'),
    allowNull: false,
    defaultValue: 'draft'
  },
  views: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  published_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'posts',
  timestamps: true,
  underscored: true
});

module.exports = Post;
