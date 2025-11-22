const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  answer: String
});

const requestSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  service: String,
  details: String,
  answers: [answerSchema],
  status: { type: String, enum: ['pending','accepted','declined','completed','cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
