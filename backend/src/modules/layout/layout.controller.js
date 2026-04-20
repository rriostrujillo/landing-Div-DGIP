const { Section } = require('../../models');

exports.listSections = async (req, res) => {
  try {
    const sections = await Section.findAll({ order: [['sort_order', 'ASC']] });
    res.render('layout/index', { sections });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.renderEditor = async (req, res) => {
  try {
    const mode = req.params.id ? 'edit' : 'new';
    let section = null;
    if (mode === 'edit') {
      section = await Section.findByPk(req.params.id);
    }
    const { Category } = require('../../models');
    const categories = await Category.findAll();
    res.render('layout/editor', { section, mode, categories });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.saveSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, sort_order, is_active, position, ...configFields } = req.body;
    
    const data = {
      title,
      type,
      sort_order: parseInt(sort_order, 10) || 0,
      is_active: !!is_active, // Checkbox present means true
      position: position || 'full',
      config: JSON.stringify(configFields)
    };

    if (id) {
      await Section.update(data, { where: { id } });
    } else {
      await Section.create(data);
    }
    
    res.redirect('/admin/layout');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.deleteSection = async (req, res) => {
  try {
    await Section.destroy({ where: { id: req.params.id } });
    res.redirect('/admin/layout');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
