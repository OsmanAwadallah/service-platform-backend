const asyncHandler = require('express-async-handler');

const getTeam = asyncHandler(async (req, res) => {
  res.json([]);
});
const getPortfolio = asyncHandler(async (req, res) => {
  res.json([]);
});
const getEvents = asyncHandler(async (req, res) => {
  res.json([]);
});
const getTestimonials = asyncHandler(async (req, res) => {
  res.json([]);
});
const getById = asyncHandler(async (req, res) => {
  res.json({});
});

module.exports = { getTeam, getPortfolio, getEvents, getTestimonials, getById };