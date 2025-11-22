const asyncHandler = require('express-async-handler');
const Request = require('../models/Request');
const Provider = require('../models/Provider');

const listRequests = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    const reqs = await Request.find().populate('client provider');
    res.json(reqs);
    return;
  }
  if (req.user.role === 'provider') {
    const providers = await Provider.find({ user: req.user._id }).select('_id');
    const providerIds = providers.map(p => p._id);
    const reqs = await Request.find({ provider: { $in: providerIds } }).populate('client provider');
    res.json(reqs);
    return;
  }
  res.status(403);
  throw new Error('Not allowed');
});

const createRequest = asyncHandler(async (req, res) => {
  const { providerId, service, details, answers } = req.body;
  if (!providerId) {
    res.status(400);
    throw new Error('providerId required');
  }
  const provider = await Provider.findById(providerId);
  if (!provider) {
    res.status(404);
    throw new Error('Provider not found');
  }
  const request = await Request.create({
    client: req.user._id,
    provider: providerId,
    service,
    details,
    answers
  });
  res.status(201).json(request);
});

const updateRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }
  if (req.user.role === 'provider') {
    const provider = await Provider.findById(request.provider);
    if (!provider || !provider.user.equals(req.user._id)) {
      res.status(403);
      throw new Error('Not allowed');
    }
  } else if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed');
  }

  const { status, details } = req.body;
  if (status) request.status = status;
  if (details) request.details = details;
  await request.save();
  res.json(request);
});

const deleteRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }
  if (!request.client.equals(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed');
  }
  await request.remove();
  res.json({ message: 'Request removed' });
});

module.exports = { listRequests, createRequest, updateRequest, deleteRequest };