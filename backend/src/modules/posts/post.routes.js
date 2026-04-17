const express = require('express');
const router = express.Router();
const postCtrl = require('./post.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { upload } = require('../../config/upload');

// Admin routes
router.get('/', requireAuth, postCtrl.listPosts);
router.get('/new', requireAuth, postCtrl.createForm);
router.post('/new', requireAuth, upload.single('cover_image'), postCtrl.createPost);
router.get('/:id/edit', requireAuth, postCtrl.editForm);
router.post('/:id/edit', requireAuth, upload.single('cover_image'), postCtrl.updatePost);
router.post('/:id/delete', requireAuth, requireRole('super_admin', 'admin'), postCtrl.deletePost);

module.exports = router;
