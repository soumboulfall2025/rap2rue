const express = require('express');
const { placeOrderPaydunya } = require('../controllers/payment.js');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware d'authentification simple (JWT)
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Non autorisé' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
}

// Route de paiement PayDunya
router.post('/paydunya', auth, placeOrderPaydunya);

module.exports = router;
