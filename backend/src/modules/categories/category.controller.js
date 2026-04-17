const slugify = require('slugify');
const { Category } = require('../../models');

// List categories
exports.listCategories = async (req, res) => {
  const categories = await Category.findAll({ order: [['sort_order', 'ASC']] });
  res.render('categories/list', { categories });
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const maxOrder = await Category.max('sort_order') || 0;
    await Category.create({ name, slug, description, color: color || '#192D63', icon, sort_order: maxOrder + 1 });
    req.flash('success', 'Categoría creada');
    res.redirect('/admin/categories');
  } catch (err) {
    console.error('Create category error:', err);
    req.flash('error', 'Error al crear la categoría');
    res.redirect('/admin/categories');
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) { req.flash('error', 'Categoría no encontrada'); return res.redirect('/admin/categories'); }
    const { name, description, color, icon, is_active } = req.body;
    await category.update({
      name, description,
      slug: slugify(name, { lower: true, strict: true }),
      color: color || '#192D63', icon,
      is_active: is_active ? 1 : 0
    });
    req.flash('success', 'Categoría actualizada');
    res.redirect('/admin/categories');
  } catch (err) {
    console.error('Update category error:', err);
    req.flash('error', 'Error al actualizar');
    res.redirect('/admin/categories');
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    req.flash('success', 'Categoría eliminada');
    res.redirect('/admin/categories');
  } catch (err) {
    req.flash('error', 'Error al eliminar');
    res.redirect('/admin/categories');
  }
};
