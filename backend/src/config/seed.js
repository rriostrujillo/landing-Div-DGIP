require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./database');
require('../models');
const { User, Category } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✅ Database reset');

    // Create super admin
    const hash = await bcrypt.hash('admin123', 12);
    await User.create({
      username: 'admin',
      email: 'dgip@unach.mx',
      password_hash: hash,
      full_name: 'Administrador DGIP',
      role: 'super_admin'
    });
    console.log('✅ Super admin created (admin / admin123)');

    // Create categories
    const cats = [
      { name: 'Investigación', slug: 'investigacion', color: '#192D63', sort_order: 1 },
      { name: 'Posgrado', slug: 'posgrado', color: '#2A4080', sort_order: 2 },
      { name: 'Innovación', slug: 'innovacion', color: '#D4B012', sort_order: 3 },
      { name: 'Eventos', slug: 'eventos', color: '#735920', sort_order: 4 },
      { name: 'Convocatorias', slug: 'convocatorias', color: '#0F1B3D', sort_order: 5 }
    ];
    await Category.bulkCreate(cats);
    console.log('✅ Categories created');

    console.log('\n🎉 Seed complete! Login with: admin / admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
