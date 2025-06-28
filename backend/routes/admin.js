const express = require('express');
const User = require('../models/User');
const Music = require('../models/Music');
const Review = require('../models/Review');
const jwt = require('jsonwebtoken');

// Middleware d'authentification
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
// Middleware admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Accès réservé à l’admin.' });
}

const router = express.Router();

// Liste tous les utilisateurs
router.get('/users', auth, isAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});
// Supprimer un utilisateur
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
// Changer le rôle d'un utilisateur
router.patch('/users/:id/role', auth, isAdmin, async (req, res) => {
  const { role } = req.body;
  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ success: true });
});
// Liste toutes les musiques
router.get('/musics', auth, isAdmin, async (req, res) => {
  const musics = await Music.find().populate('artist', 'name');
  res.json(musics);
});
// Supprimer une musique
router.delete('/musics/:id', auth, isAdmin, async (req, res) => {
  await Music.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
// Stats globales
router.get('/stats', auth, isAdmin, async (req, res) => {
  const userCount = await User.countDocuments();
  const musicCount = await Music.countDocuments();
  const reviewCount = await Review.countDocuments();
  res.json({ userCount, musicCount, reviewCount });
});

module.exports = router;
