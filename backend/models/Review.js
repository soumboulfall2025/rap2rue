const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  music: { type: mongoose.Schema.Types.ObjectId, ref: 'Music', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
