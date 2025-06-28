const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  coverUrl: { type: String, required: true },
  audioUrl: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Music', musicSchema);
