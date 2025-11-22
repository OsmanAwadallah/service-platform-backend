const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const slugify = require('../utils/slugify');

const listPosts = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, q, tag, authorId, sort } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const filter = {};
  if (q) {
    filter.$or = [
      { title: new RegExp(q, 'i') },
      { content: new RegExp(q, 'i') }
    ];
  }
  if (tag) filter.tags = tag;
  if (authorId) filter.author = authorId;

  let query = Post.find(filter).populate('author', 'name email');
  if (sort) query = query.sort(sort);
  const total = await Post.countDocuments(filter);
  const posts = await query.skip((page - 1) * limit).limit(limit).exec();
  res.json({ data: posts, meta: { page, limit, total } });
});

const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name email');
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.json(post);
});

const createPost = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('Title required');
  }
  const post = await Post.create({
    title,
    slug: slugify(title),
    content,
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    author: req.user._id
  });
  res.status(201).json(post);
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (!post.author.equals(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed');
  }
  const { title, content, tags, published } = req.body;
  if (title) {
    post.title = title;
    post.slug = slugify(title);
  }
  if (content !== undefined) post.content = content;
  if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  if (published !== undefined) post.published = published;
  await post.save();
  res.json(post);
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (!post.author.equals(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed');
  }
  await post.remove();
  res.json({ message: 'Post removed' });
});

const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  const userId = req.user ? req.user._id : null;
  if (!userId) {
    res.json({ message: 'Like accepted (no user)' });
    return;
  }
  const has = post.likes.find(l => l.equals(userId));
  if (has) {
    post.likes = post.likes.filter(l => !l.equals(userId));
  } else {
    post.likes.push(userId);
  }
  await post.save();
  res.json({ likesCount: post.likes.length });
});

module.exports = { listPosts, getPost, createPost, updatePost, deletePost, likePost };