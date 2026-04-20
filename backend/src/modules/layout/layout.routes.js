const express = require('express');
const router = express.Router();
const layoutCtrl = require('./layout.controller');
const { requireAuth } = require('../../middleware/auth');

router.get('/', requireAuth, layoutCtrl.listSections);
router.get('/new', requireAuth, layoutCtrl.renderEditor);
router.get('/:id/edit', requireAuth, layoutCtrl.renderEditor);
router.post('/new', requireAuth, layoutCtrl.saveSection);
router.post('/:id/edit', requireAuth, layoutCtrl.saveSection);
router.post('/:id/delete', requireAuth, layoutCtrl.deleteSection);

module.exports = router;
