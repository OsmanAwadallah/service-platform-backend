const express = require('express');
const router = express.Router();
const { listPosts, getPost, createPost, updatePost, deletePost, likePost } = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', listPosts);
router.get('/:id', getPost);
router.post('/:id/like', protect, likePost);

router.post('/', protect, authorize('admin', 'provider'), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;