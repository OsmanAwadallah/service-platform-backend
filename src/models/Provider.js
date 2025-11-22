const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: String,
  required: { type: Boolean, default: false }
}, { _id: true });

const reviewSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const providerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  description: String,
  categories: [String],
  profile: {
    address: String,
    phone: String
  },
  questions: [questionSchema],
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);
