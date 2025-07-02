const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');
const passport = require('../config/passport');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer la bibliothèque de l'utilisateur connecté
router.get('/library', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'library',
      populate: { path: 'artist', select: 'name' }
    });
    res.json(user.library || []);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Modifier le profil (nom/email/avatar)
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Nom et email requis.' });
    }
    // Vérifier si l'email est déjà pris par un autre utilisateur
    const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existing) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }
    const update = { name, email };
    if (avatar) update.avatar = avatar;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      update,
      { new: true, runValidators: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Changer le mot de passe
router.patch('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      console.error('Champs manquants:', req.body);
      return res.status(400).json({ message: 'Champs requis.' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('Utilisateur non trouvé:', req.user.id);
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.error('Mot de passe actuel incorrect pour user', req.user.id);
      return res.status(401).json({ message: 'Mot de passe actuel incorrect.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Mot de passe modifié.' });
  } catch (err) {
    console.error('Erreur serveur changement mot de passe:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Demande de réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requis.' });
  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé.' });
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 min
  await user.save();
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  await sendMail({
    to: user.email,
    subject: 'Réinitialisation de mot de passe',
    html: `<p>Pour réinitialiser votre mot de passe, cliquez sur ce lien : <a href="${resetUrl}">${resetUrl}</a></p>`
  });
  res.json({ message: 'Si cet email existe, un lien a été envoyé.' });
});

// Réinitialisation du mot de passe
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Mot de passe requis.' });
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ message: 'Lien invalide ou expiré.' });
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Mot de passe réinitialisé.' });
});

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: FRONTEND_URL + '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${FRONTEND_URL}/social-callback?token=${token}`);
  }
);

// Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: FRONTEND_URL + '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${FRONTEND_URL}/social-callback?token=${token}`);
  }
);

// Route pour récupérer le profil utilisateur à partir du JWT
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Permettre à un utilisateur social de choisir son rôle après inscription
router.patch('/social-role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['fan', 'artist'].includes(role)) return res.status(400).json({ message: 'Rôle invalide.' });
    const user = await User.findByIdAndUpdate(req.user.id, { role, roleSet: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
