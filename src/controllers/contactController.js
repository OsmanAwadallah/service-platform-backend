const asyncHandler = require('express-async-handler');
const Contact = require('../models/Contact');

const sendContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error('All fields required');
  }
  const c = await Contact.create({ name, email, message });
  res.status(201).json(c);
});

const listContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort('-createdAt');
  res.json(contacts);
});

module.exports = { sendContact, listContacts };