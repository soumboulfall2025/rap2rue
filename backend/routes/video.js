const express = require('express');
const Video = require('../models/Video');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware de log global pour toutes les requêtes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Route publique : feed vidéo façon TikTok (pagination, uniquement vidéos validées)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const videos = await Video.find({ isValidated: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('artist', 'name avatar');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Upload vidéo (artistes uniquement, non validée par défaut)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, url } = req.body;
    if (!title || !url) return res.status(400).json({ message: 'Titre et URL requis.' });
    // Vérifie que l'utilisateur est artiste
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'artist') return res.status(403).json({ message: 'Seuls les artistes peuvent uploader.' });
    const video = await Video.create({
      title,
      description,
      url,
      artist: user._id,
      isValidated: false
    });
    console.log('Vidéo créée (en attente validation) :', video);
    res.status(201).json(video);
  } catch (err) {
    console.error('Erreur upload vidéo :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Validation d'une vidéo (admin uniquement)
router.patch('/:id/validate', auth, async (req, res) => {
  try {
    // Vérifie que l'utilisateur est admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Seul un admin peut valider.' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Vidéo non trouvée.' });
    video.isValidated = true;
    video.createdAt = new Date(); // Met à jour la date pour remonter la vidéo en haut du feed
    await video.save();
    res.json({ message: 'Vidéo validée.', video });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Liste des vidéos d'un artiste (protégée, toutes vidéos)
router.get('/my', auth, async (req, res) => {
  try {
    const videos = await Video.find({ artist: req.user.id }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Suppression d'une vidéo (admin ou artiste propriétaire)
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Vidéo non trouvée.' });
    const user = await User.findById(req.user.id);
    // Autorisé si admin OU propriétaire
    if (user.role !== 'admin' && video.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }
    await video.deleteOne();
    res.json({ message: 'Vidéo supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Édition d'une vidéo (artiste uniquement, propriétaire)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Vidéo non trouvée.' });
    if (video.artist.toString() !== req.user.id) return res.status(403).json({ message: 'Non autorisé.' });
    if (title) video.title = title;
    if (description) video.description = description;
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Like/unlike une vidéo (toggle)
router.post('/:id/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Vidéo non trouvée.' });
    const userId = req.user.id;
    const index = video.likes.findIndex(id => id.toString() === userId);
    if (index === -1) {
      video.likes.push(userId);
      await video.save();
      return res.json({ liked: true, likes: video.likes.length });
    } else {
      video.likes.splice(index, 1);
      await video.save();
      return res.json({ liked: false, likes: video.likes.length });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Ajouter un commentaire
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Commentaire requis.' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Vidéo non trouvée.' });
    video.comments.push({ user: req.user.id, text });
    await video.save();
    res.status(201).json(video.comments[video.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer les commentaires d'une vidéo
router.get('/:id/comments', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('comments.user', 'name avatar');
    if (!video) return res.status(404).json({ message: 'Vidéo non trouvée.' });
    res.json(video.comments);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Stats d'une vidéo
router.get('/:id/stats', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Vidéo non trouvée.' });
    res.json({ likes: video.likes.length, comments: video.comments.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Liste toutes les vidéos (admin uniquement, filtrage possible)
router.get('/all', auth, async (req, res) => {
  try {
    // Vérifie que l'utilisateur est admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Seul un admin peut accéder à cette liste.' });
    const filter = {};
    if (req.query.validated === 'false') filter.isValidated = false;
    if (req.query.validated === 'true') filter.isValidated = true;
    const videos = await Video.find(filter).sort({ createdAt: -1 }).populate('artist', 'name avatar');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
