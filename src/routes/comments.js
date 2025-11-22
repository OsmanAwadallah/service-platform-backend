const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  listCommentsForPost,
  addComment,
  updateComment,
  deleteComment,
  likeComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/', listCommentsForPost);
router.post('/', protect, addComment);

router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);

module.exports = router;