const express = require('express');
const router = express.Router();
const catCtrl = require('./category.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');

router.get('/', requireAuth, catCtrl.listCategories);
router.post('/new', requireAuth, requireRole('super_admin', 'admin'), catCtrl.createCategory);
router.post('/:id/update', requireAuth, requireRole('super_admin', 'admin'), catCtrl.updateCategory);
router.post('/:id/delete', requireAuth, requireRole('super_admin'), catCtrl.deleteCategory);

module.exports = router;
