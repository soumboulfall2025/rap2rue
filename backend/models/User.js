const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['artist', 'fan', 'admin'], required: false, default: 'fan' }, // Ajout default
  library: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Music' }],
  avatar: { type: String }, // URL ou base64
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  googleId: { type: String },
  facebookId: { type: String },
  roleSet: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
