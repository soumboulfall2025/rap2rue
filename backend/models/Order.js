const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      name: { type: String, required: true }, // Nom du produit (musique)
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 },
      description: { type: String },
      // musicId n'est plus obligatoire si tu veux gérer des items divers
      musicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Music' },
    }
  ],
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'paydunya' },
  payment: { type: Boolean, default: false },

  // Nouveau : informations PayDunya
  paydunyaInvoiceId: { type: String }, // ID de la facture PayDunya
  paydunyaResponse: { type: Object }, // Réponse complète (utile pour debug et suivi)

  date: { type: Date, default: Date.now },
  address: { type: String },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
