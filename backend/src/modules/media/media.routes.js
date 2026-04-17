const express = require('express');
const router = express.Router();
const mediaCtrl = require('./media.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { upload } = require('../../config/upload');

router.get('/', requireAuth, mediaCtrl.listMedia);
router.post('/upload', requireAuth, upload.array('files', 20), mediaCtrl.uploadMedia);
router.post('/:id/delete', requireAuth, requireRole('super_admin', 'admin'), mediaCtrl.deleteMedia);

module.exports = router;
