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
const postCtrl = require('./modules/posts/post.controller');
const { requireAuth } = require('./middleware/auth');
const { Post, Category, User, Media } = require('./models');

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
app.get('/api/posts/featured', postCtrl.apiGetFeatured);
app.get('/api/posts/:slug', postCtrl.apiGetPost);
app.get('/api/categories', postCtrl.apiGetCategories);

// ===== ADMIN ROUTES =====
app.use('/admin', authRoutes);
app.get('/admin', requireAuth, async (req, res) => {
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
  res.render('dashboard', { stats: { totalPosts, publishedPosts, featuredPosts, totalCategories, totalMedia }, recentPosts });
});
app.use('/admin/posts', postRoutes);
app.use('/admin/categories', categoryRoutes);
app.use('/admin/media', mediaRoutes);

// ===== FRONTEND (serve static) =====
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(process.env.UPLOAD_DIR || path.join(__dirname, '../uploads')));
app.use('/', express.static(path.join(__dirname, '../../docs')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'docs', 'index.html'));
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
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
