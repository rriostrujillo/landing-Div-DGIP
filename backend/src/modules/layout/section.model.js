const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Section = sequelize.define('Section', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  type: { 
    type: DataTypes.STRING, // 'hero_slider', 'articles_feed', 'banner_horizontal', 'separator'
    allowNull: false 
  },
  config: { 
    type: DataTypes.TEXT, 
    defaultValue: '{}'
  },
  sort_order: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  position: { 
    type: DataTypes.ENUM('full', 'left', 'right'), 
    defaultValue: 'full' 
  },
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
}, {
  tableName: 'sections',
  underscored: true,
  timestamps: true
});

module.exports = Section;
