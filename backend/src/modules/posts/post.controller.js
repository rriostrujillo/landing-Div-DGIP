const slugify = require('slugify');
const { Op } = require('sequelize');
const { Post, Category, User, Attachment, Media } = require('../../models');

// ===== ADMIN CONTROLLERS =====

// List all posts (admin)
exports.listPosts = async (req, res) => {
  try {
    const { status, category } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category_id = category;

    const posts = await Post.findAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['name', 'slug', 'color'] },
        { model: User, as: 'author', attributes: ['full_name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    const categories = await Category.findAll({ where: { is_active: 1 }, order: [['sort_order', 'ASC']] });
    res.render('posts/list', { posts, categories, filters: { status, category } });
  } catch (err) {
    console.error('List posts error:', err);
    req.flash('error', 'Error al cargar los artículos');
    res.redirect('/admin');
  }
};

// Show create form
exports.createForm = async (req, res) => {
  const categories = await Category.findAll({ where: { is_active: 1 }, order: [['sort_order', 'ASC']] });
  res.render('posts/editor', { post: null, categories, mode: 'create' });
};

// Show edit form
exports.editForm = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: Attachment, as: 'attachments', include: [{ model: Media, as: 'media' }] }
      ]
    });
    if (!post) { req.flash('error', 'Artículo no encontrado'); return res.redirect('/admin/posts'); }
    const categories = await Category.findAll({ where: { is_active: 1 }, order: [['sort_order', 'ASC']] });
    res.render('posts/editor', { post, categories, mode: 'edit' });
  } catch (err) {
    console.error('Edit form error:', err);
    res.redirect('/admin/posts');
  }
};

// Create post
exports.createPost = async (req, res) => {
  try {
    const { title, excerpt, content, category_id, status } = req.body;
    let slug = slugify(title, { lower: true, strict: true });

    // Ensure unique slug
    const existing = await Post.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await Post.create({
      title, slug, excerpt, content,
      category_id: category_id || null,
      author_id: req.session.user.id,
      status: status || 'draft',
      cover_image: req.file ? `/uploads/${req.file.filename}` : null,
      published_at: status === 'published' || status === 'featured' ? new Date() : null
    });

    req.flash('success', 'Artículo creado exitosamente');
    res.redirect(`/admin/posts/${post.id}/edit`);
  } catch (err) {
    console.error('Create post error:', err);
    req.flash('error', 'Error al crear el artículo');
    res.redirect('/admin/posts/new');
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) { req.flash('error', 'Artículo no encontrado'); return res.redirect('/admin/posts'); }

    const { title, excerpt, content, category_id, status } = req.body;
    const updateData = { title, excerpt, content, category_id: category_id || null, status };

    if (title !== post.title) {
      updateData.slug = slugify(title, { lower: true, strict: true });
    }
    if (req.file) {
      updateData.cover_image = `/uploads/${req.file.filename}`;
    }
    if ((status === 'published' || status === 'featured') && !post.published_at) {
      updateData.published_at = new Date();
    }

    await post.update(updateData);
    req.flash('success', 'Artículo actualizado');
    res.redirect(`/admin/posts/${post.id}/edit`);
  } catch (err) {
    console.error('Update post error:', err);
    req.flash('error', 'Error al actualizar');
    res.redirect('/admin/posts');
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    await Post.destroy({ where: { id: req.params.id } });
    req.flash('success', 'Artículo eliminado');
    res.redirect('/admin/posts');
  } catch (err) {
    console.error('Delete post error:', err);
    req.flash('error', 'Error al eliminar');
    res.redirect('/admin/posts');
  }
};

// ===== PUBLIC API CONTROLLERS =====

// Get published posts (API)
exports.apiGetPosts = async (req, res) => {
  try {
    const { limit = 9, offset = 0, category, status } = req.query;
    const where = { status: status || { [Op.in]: ['published', 'featured'] } };
    if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) where.category_id = cat.id;
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['name', 'slug', 'color'] },
        { model: User, as: 'author', attributes: ['full_name'] }
      ],
      order: [['published_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['content'] }
    });

    res.json({ total: count, posts: rows });
  } catch (err) {
    console.error('API posts error:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Get featured posts for slider (API)
exports.apiGetFeatured = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: 'featured' },
      include: [
        { model: Category, as: 'category', attributes: ['name', 'slug', 'color'] }
      ],
      order: [['published_at', 'DESC']],
      limit: 6,
      attributes: ['id', 'title', 'slug', 'excerpt', 'cover_image', 'published_at']
    });
    res.json({ posts });
  } catch (err) {
    console.error('API featured error:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Get single post by slug (API)
exports.apiGetPost = async (req, res) => {
  try {
    const post = await Post.findOne({
      where: { slug: req.params.slug, status: { [Op.in]: ['published', 'featured'] } },
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'author', attributes: ['full_name', 'avatar'] },
        { model: Attachment, as: 'attachments', include: [{ model: Media, as: 'media' }] }
      ]
    });
    if (!post) return res.status(404).json({ error: 'Artículo no encontrado' });

    await post.increment('views');
    res.json({ post });
  } catch (err) {
    console.error('API post error:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Get categories (API)
exports.apiGetCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: 1 },
      order: [['sort_order', 'ASC']],
      attributes: ['id', 'name', 'slug', 'color', 'description']
    });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};
