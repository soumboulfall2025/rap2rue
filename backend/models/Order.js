const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      musicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Music', required: true },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
      description: String,
    }
  ],
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'paydunya' },
  payment: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  address: { type: String },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
