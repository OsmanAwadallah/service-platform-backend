const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

const buildTree = (comments) => {
  const map = {};
  comments.forEach(c => { map[c._id] = { ...c.toObject(), children: [] }; });
  const roots = [];
  comments.forEach(c => {
    if (c.parent) {
      const p = map[c.parent];
      if (p) p.children.push(map[c._id]);
    } else {
      roots.push(map[c._id]);
    }
  });
  return roots;
};

const listCommentsForPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  const comments = await Comment.find({ post: postId }).sort('createdAt').populate('author', 'name');
  res.json(buildTree(comments));
});

const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content, parent } = req.body;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  const author = req.user ? req.user._id : null;
  if (!content) {
    res.status(400);
    throw new Error('Content required');
  }
  const comment = await Comment.create({ post: postId, author, content, parent: parent || null });
  res.status(201).json(comment);
});

const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  if (!comment.author || !comment.author.equals(req.user._id)) {
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not allowed');
    }
  }
  comment.content = req.body.content || comment.content;
  await comment.save();
  res.json(comment);
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  if (!comment.author || !comment.author.equals(req.user._id)) {
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not allowed');
    }
  }
  await comment.remove();
  res.json({ message: 'Comment removed' });
});

const likeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  const userId = req.user ? req.user._id : null;
  if (!userId) {
    res.json({ message: 'Like accepted (no user)' });
    return;
  }
  const idx = comment.likes.find(l => l.equals(userId));
  if (idx) {
    comment.likes = comment.likes.filter(l => !l.equals(userId));
  } else {
    comment.likes.push(userId);
  }
  await comment.save();
  res.json({ likesCount: comment.likes.length });
});

module.exports = { listCommentsForPost, addComment, updateComment, deleteComment, likeComment };