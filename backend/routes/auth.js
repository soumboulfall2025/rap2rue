const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorizeRole = require('../middleware/authorizeRole');
const { sendMail } = require('../utils/mailer');
const passport = require('../config/passport');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Trop de requêtes, réessayez plus tard.',
});

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('fan', 'artist').required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/register', authLimiter, async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Erreur /register :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Erreur /login :', err);
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

// Routes Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: FRONTEND_URL + '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${FRONTEND_URL}/social-callback?token=${token}`);
  }
);

// Routes Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: FRONTEND_URL + '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${FRONTEND_URL}/social-callback?token=${token}`);
  }
);

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json({ user });
  } catch (err) {
    console.error('Erreur /me :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.patch('/profile', auth, async (req, res) => {
  const { name, email, avatar } = req.body;
  if (!name || !email)
    return res.status(400).json({ message: 'Nom et email requis.' });

  try {
    const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existing)
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });

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
    console.error('Erreur /profile :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.patch('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'Champs requis.' });

  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Mot de passe actuel incorrect.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Mot de passe modifié.' });
  } catch (err) {
    console.error('Erreur /password :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requis.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'Si cet email existe, un lien a été envoyé.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
    await sendMail({
      to: user.email,
      subject: 'Réinitialisation de mot de passe',
      html: `<p>Pour réinitialiser votre mot de passe, cliquez sur ce lien : <a href="${resetUrl}">${resetUrl}</a></p>`
    });

    res.json({ message: 'Si cet email existe, un lien a été envoyé.' });
  } catch (err) {
    console.error('Erreur /forgot-password :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Mot de passe requis.' });

  try {
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
  } catch (err) {
    console.error('Erreur /reset-password :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Exemple d'une route admin protégée par rôle
router.get('/admin/data', auth, authorizeRole(['admin']), (req, res) => {
  res.json({ secretData: 'Données réservées aux admins' });
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
