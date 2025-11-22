const asyncHandler = require('express-async-handler');
const Provider = require('../models/Provider');
const User = require('../models/User');

const listProviders = asyncHandler(async (req, res) => {
  const { q, category, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (q) filter.name = new RegExp(q, 'i');
  if (category) filter.categories = category;
  const providers = await Provider.find(filter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json(providers);
});

const getProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id).populate('user', 'name email');
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  res.json(provider);
});

const createProvider = asyncHandler(async (req, res) => {
  const { name, description, categories } = req.body;
  const owner = req.user ? req.user._id : null;
  if (!name) {
    res.status(400);
    throw new Error('Name required');
  }
  const provider = await Provider.create({
    user: owner,
    name,
    description,
    categories: Array.isArray(categories) ? categories : (categories ? categories.split(',') : [])
  });
  res.status(201).json(provider);
});

const updateProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  if (!provider.user || !provider.user.equals(req.user._id)) {
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not allowed');
    }
  }
  const { name, description, categories, profile } = req.body;
  if (name) provider.name = name;
  if (description) provider.description = description;
  if (categories !== undefined) provider.categories = Array.isArray(categories) ? categories : categories.split(',');
  if (profile) provider.profile = profile;
  await provider.save();
  res.json(provider);
});

const deleteProvider = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admin can delete');
  }
  await provider.remove();
  res.json({ message: 'Provider removed' });
});

const addReview = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  const { rating, comment } = req.body;
  if (!rating) {
    res.status(400);
    throw new Error('Rating required');
  }
  provider.reviews.push({ author: req.user._id, rating, comment });
  await provider.save();
  res.status(201).json(provider);
});

const requestProvider = asyncHandler(async (req, res) => {
  res.status(501).json({ message: 'Use /api/requests to create service requests' });
});

const getProfile = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id).populate('user', 'name email');
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  res.json(provider);
});

const listQuestions = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  res.json(provider.questions || []);
});

const addQuestion = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  provider.questions.push(req.body);
  await provider.save();
  res.status(201).json(provider.questions);
});

const updateQuestion = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  const q = provider.questions.id(req.params.questionId);
  if (!q) {
    res.status(404);
    throw new Error('Question not found');
  }
  q.text = req.body.text ?? q.text;
  q.required = req.body.required ?? q.required;
  await provider.save();
  res.json(q);
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const provider = await Provider.findById(req.params.id);
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  provider.questions.id(req.params.questionId)?.remove();
  await provider.save();
  res.json({ message: 'Question removed' });
});

module.exports = {
  listProviders, getProvider, createProvider, updateProvider, deleteProvider,
  addReview, requestProvider, getProfile, listQuestions, addQuestion, updateQuestion, deleteQuestion
};