require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cors = require('cors');
const fs = require('fs');

const sequelize = require('./config/database');
require('./models'); // Initialize associations

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const postRoutes = require('./modules/posts/post.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const mediaRoutes = require('./modules/media/media.routes');
const layoutRoutes = require('./modules/layout/layout.routes');
const postCtrl = require('./modules/posts/post.controller');
const { requireAuth } = require('./middleware/auth');
const { Post, Category, User, Media, Section } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/admin/assets', express.static(path.join(__dirname, '..', 'public', 'admin')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dgip-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
app.use(flash());

// Flash messages locals
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.session.user || null;
  next();
});

// ===== PUBLIC API ROUTES =====
app.get('/api/posts', postCtrl.apiGetPosts);
app.get('/api/posts/featured', async (req, res) => {
  try {
    const { category_id, limit = 5 } = req.query;
    const where = { status: 'featured' };
    if (category_id && category_id !== 'undefined') where.category_id = category_id;

    const posts = await Post.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['name', 'slug', 'color'] }],
      order: [['published_at', 'DESC']],
      limit: parseInt(limit) || 5,
      attributes: ['id', 'title', 'slug', 'excerpt', 'cover_image', 'published_at']
    });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/posts/:slug', postCtrl.apiGetPost);
app.get('/api/categories', postCtrl.apiGetCategories);

app.get('/api/layout', async (req, res) => {
  try {
    const sections = await Section.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']]
    });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ===== ADMIN ROUTES =====
app.use('/admin', authRoutes);
app.get('/admin', requireAuth, async (req, res) => {
  try {
    const totalPosts = await Post.count();
    const publishedPosts = await Post.count({ where: { status: 'published' } });
    const featuredPosts = await Post.count({ where: { status: 'featured' } });
    const totalCategories = await Category.count();
    const totalMedia = await Media.count();
    const recentPosts = await Post.findAll({
      include: [{ model: Category, as: 'category' }, { model: User, as: 'author', attributes: ['full_name'] }],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Category impact stats
    const categoryStats = await Category.findAll({
      attributes: [
        'id', 'name', 'color',
        [sequelize.fn('SUM', sequelize.literal('COALESCE(views, 0)')), 'total_views'],
        [sequelize.fn('COUNT', sequelize.col('posts.id')), 'post_count']
      ],
      include: [{ model: Post, as: 'posts', attributes: [] }],
      group: ['Category.id'],
      order: [[sequelize.literal('total_views'), 'DESC']]
    });

    res.render('dashboard', { 
      stats: { totalPosts, publishedPosts, featuredPosts, totalCategories, totalMedia }, 
      recentPosts,
      categoryStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});

// CSV Export route
app.get('/admin/stats/export', requireAuth, async (req, res) => {
  try {
    const stats = await Category.findAll({
      attributes: [
        'name',
        [sequelize.fn('SUM', sequelize.literal('COALESCE(views, 0)')), 'total_views'],
        [sequelize.fn('COUNT', sequelize.col('posts.id')), 'post_count']
      ],
      include: [{ model: Post, as: 'posts', attributes: [] }],
      group: ['Category.id']
    });

    let csv = 'Categoria,Total Impactos (Vistas),Cantidad de Articulos\n';
    stats.forEach(s => {
      csv += `"${s.name}",${s.get('total_views') || 0},${s.get('post_count') || 0}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=informe_dgip_${new Date().toISOString().slice(0,7)}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating report');
  }
});
app.use('/admin/posts', postRoutes);
app.use('/admin/categories', categoryRoutes);
app.use('/admin/media', mediaRoutes);
app.use('/admin/layout', layoutRoutes);

// ===== FRONTEND (serve static) =====
const docsPath = path.resolve(__dirname, '..', '..', 'docs');
console.log('📂 Serving frontend from:', docsPath);

app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));
app.use('/', express.static(docsPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(docsPath, 'index.html'));
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    const isSqlite = sequelize.getDialect() === 'sqlite';
    await sequelize.sync({ alter: !isSqlite && process.env.NODE_ENV === 'development' });
    console.log('✅ Models synchronized');

    app.listen(PORT, () => {
      console.log(`🚀 DGIP Portal running on http://localhost:${PORT}`);
      console.log(`📋 Admin panel: http://localhost:${PORT}/admin`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
}

start();
