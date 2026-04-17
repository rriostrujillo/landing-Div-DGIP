const path = require('path');
const fs = require('fs');
const { Media } = require('../../models');
const { UPLOAD_DIR } = require('../../config/upload');

// List media files
exports.listMedia = async (req, res) => {
  try {
    const { type } = req.query;
    const where = {};
    if (type === 'image') where.mime_type = { [require('sequelize').Op.like]: 'image/%' };
    else if (type === 'video') where.mime_type = { [require('sequelize').Op.like]: 'video/%' };
    else if (type === 'pdf') where.mime_type = 'application/pdf';

    const media = await Media.findAll({ where, order: [['created_at', 'DESC']] });
    
    // If JSON requested (from editor), return JSON
    if (req.query.json === '1' || req.headers.accept?.includes('application/json')) {
      return res.json({ media });
    }
    res.render('media/manager', { media, filter: type || 'all' });
  } catch (err) {
    console.error('List media error:', err);
    req.flash('error', 'Error al cargar la biblioteca de medios');
    res.redirect('/admin');
  }
};

// Upload file(s)
exports.uploadMedia = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    const uploaded = [];

    for (const file of files) {
      // Store original image as thumbnail (no processing)
      const thumbnailPath = file.mimetype.startsWith('image/') ? `/uploads/${file.filename}` : null;

      const media = await Media.create({
        filename: file.filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
        thumbnail_path: thumbnailPath ? `/${thumbnailPath}` : null,
        alt_text: path.parse(file.originalname).name,
        uploaded_by: req.session.user.id
      });
      uploaded.push(media);
    }

    if (req.headers.accept?.includes('application/json') || req.query.json === '1') {
      return res.json({ success: true, media: uploaded });
    }
    req.flash('success', `${uploaded.length} archivo(s) subido(s)`);
    res.redirect('/admin/media');
  } catch (err) {
    console.error('Upload error:', err);
    if (req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ error: 'Error al subir archivos' });
    }
    req.flash('error', 'Error al subir archivos');
    res.redirect('/admin/media');
  }
};

// Delete media
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (!media) { req.flash('error', 'Archivo no encontrado'); return res.redirect('/admin/media'); }

    // Delete physical files
    const filePath = path.join(UPLOAD_DIR, media.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (media.thumbnail_path) {
      const thumbPath = path.join(__dirname, '..', '..', '..', media.thumbnail_path);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    await media.destroy();
    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true });
    }
    req.flash('success', 'Archivo eliminado');
    res.redirect('/admin/media');
  } catch (err) {
    console.error('Delete media error:', err);
    req.flash('error', 'Error al eliminar');
    res.redirect('/admin/media');
  }
};
