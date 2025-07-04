const express = require('express');
const User = require('../models/User');
const Music = require('../models/Music');
const auth = require('../middleware/auth');
const router = express.Router();

// S'abonner/désabonner à un artiste
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const artist = await User.findById(req.params.id);
    if (!artist || artist.role !== 'artist') return res.status(404).json({ message: 'Artiste non trouvé.' });
    const userId = req.user.id;
    if (artist._id.toString() === userId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous abonner à vous-même.' });
    }
    const index = artist.followers.findIndex(id => id.toString() === userId);
    let followed;
    if (index === -1) {
      artist.followers.push(userId);
      followed = true;
    } else {
      artist.followers.splice(index, 1);
      followed = false;
    }
    await artist.save();
    // Temps réel
    const io = req.app.get('io');
    io.emit('artist_follow', { artistId: artist._id.toString(), followers: artist.followers.length });
    res.json({ followed, followers: artist.followers.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Nombre d'abonnés d'un artiste
router.get('/:id/followers', async (req, res) => {
  try {
    const artist = await User.findById(req.params.id);
    if (!artist || artist.role !== 'artist') return res.status(404).json({ message: 'Artiste non trouvé.' });
    res.json({ followers: artist.followers.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer un utilisateur par son id (profil public)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    let musicCount = 0;
    if (user.role === 'artist') {
      musicCount = await Music.countDocuments({ artist: user._id });
    }
    res.json({ user: { ...user.toObject(), musicCount } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
