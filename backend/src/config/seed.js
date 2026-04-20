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

    // Create initial layout sections
    const { Section } = require('../models');
    const sections = [
      { 
        title: 'Carrusel Principal', 
        type: 'hero_slider', 
        config: JSON.stringify({ limit: 5 }), 
        sort_order: 1 
      },
      { 
        title: 'Separador Ciencia', 
        type: 'separator', 
        config: JSON.stringify({ icon: 'fas fa-flask', text: 'Divulgación del Conocimiento', sub: 'Investigación · Innovación · Ciencia' }), 
        sort_order: 2 
      },
      { 
        title: 'Feed de Noticias', 
        type: 'articles_feed', 
        config: JSON.stringify({ limit: 9, category_id: null, layout: 'grid' }), 
        sort_order: 3 
      },
      { 
        title: 'Banner UNACH', 
        type: 'banner_horizontal', 
        config: JSON.stringify({ 
          title: 'Construyendo el futuro a través de la ciencia', 
          text: 'La Dirección General de Investigación y Posgrado promueve la generación, difusión y aplicación del conocimiento científico y tecnológico',
          button_text: 'Conoce más sobre la DGIP',
          button_link: 'http://www.dgip.unach.mx'
        }), 
        sort_order: 4 
      }
    ];
    await Section.bulkCreate(sections);
    console.log('✅ Initial layout sections created');

    console.log('\n🎉 Seed complete! Login with: admin / admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
