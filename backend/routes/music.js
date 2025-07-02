const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Music = require('../models/Music');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Paydunya = require('paydunya');
const Review = require('../models/Review');
const fs = require('fs');

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage pour cover (image)
const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rap2rue/covers',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    resource_type: 'image',
  },
});
// Storage pour audio
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rap2rue/audios',
    allowed_formats: ['mp3', 'wav', 'aac', 'ogg'],
    resource_type: 'video', // Cloudinary traite l'audio comme 'video'
  },
});

// Utilisation du storage Cloudinary pour chaque champ
const upload = multer({
  storage: multer.diskStorage({}) // fallback, mais on va gérer manuellement dans la route
});
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

// Upload musique
router.post('/upload', auth, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
]), async (req, res) => {
  try {
    const { title, genre, price, description } = req.body;
    if (!title || !genre || !price || !description || !req.files.cover || !req.files.audio) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
    if (parseInt(price, 10) < 2000) {
      return res.status(400).json({ message: 'Le prix minimum est de 2000 F CFA.' });
    }
    // Vérification que l'utilisateur est bien un artiste
    const artist = await User.findById(req.user.id);
    if (!artist || artist.role !== 'artist') {
      return res.status(400).json({ message: 'Seuls les artistes peuvent uploader des musiques.' });
    }
    // Upload cover
    const coverResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        req.files.cover[0].path,
        { folder: 'rap2rue/covers', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    // Upload audio
    const audioResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        req.files.audio[0].path,
        { folder: 'rap2rue/audios', resource_type: 'video' },
        (err, audioRes) => {
          if (err) reject(err);
          else resolve(audioRes);
        }
      );
    });
    // Suppression des fichiers temporaires
    fs.unlink(req.files.cover[0].path, () => {});
    fs.unlink(req.files.audio[0].path, () => {});
    // Création musique
    const music = new Music({
      title,
      genre,
      price,
      description,
      coverUrl: coverResult.secure_url,
      audioUrl: audioResult.secure_url,
      artist: req.user.id,
    });
    await music.save();
    res.status(201).json({ message: 'Musique uploadée !', music });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer toutes les musiques
router.get('/', async (req, res) => {
  try {
    const musics = await Music.find().populate('artist', 'name');
    res.json(musics);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Route d'achat de musique (Paydunya simulation)
router.post('/buy/:id', auth, async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) return res.status(404).json({ message: 'Musique introuvable.' });
    if (music.artist.toString() === req.user.id) return res.status(400).json({ message: 'Impossible d’acheter sa propre musique.' });

    // Simulation Paydunya (à remplacer par l'intégration réelle)
    // ... ici tu peux intégrer la logique Paydunya ...
    // Pour la démo, on ajoute la musique à la bibliothèque de l'utilisateur
    const user = await User.findById(req.user.id);
    if (!user.library) user.library = [];
    if (user.library.includes(music._id)) return res.status(400).json({ message: 'Déjà achetée.' });
    user.library.push(music._id);
    await user.save();
    res.json({ message: 'Achat réussi, musique débloquée !' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Poster un avis (seulement si la musique est achetée)
router.post('/:id/review', auth, async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) return res.status(404).json({ message: 'Musique introuvable.' });
    const user = await User.findById(req.user.id);
    if (!user.library || !user.library.includes(music._id)) {
      return res.status(403).json({ message: 'Tu dois acheter la musique pour laisser un avis.' });
    }
    const { note, comment } = req.body;
    if (!note || !comment) return res.status(400).json({ message: 'Note et commentaire obligatoires.' });
    // Un seul avis par user/music
    const already = await Review.findOne({ music: music._id, user: user._id });
    if (already) return res.status(400).json({ message: 'Tu as déjà laissé un avis.' });
    const review = new Review({ music: music._id, user: user._id, note, comment });
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer les avis d'une musique
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ music: req.params.id }).populate('user', 'name');
    res.json(reviews);
  } catch {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Dashboard artiste : toutes les musiques de l'artiste connecté
router.get('/artist-dashboard', auth, async (req, res) => {
  try {
    // Récupérer toutes les musiques de l'artiste
    const musics = await Music.find({ artist: req.user.id });
    const musicIds = musics.map(m => m._id);

    // Calculer le nombre total de ventes (nombre d'achats de ses musiques)
    const Order = require('../models/Order');
    // On ne prend en compte que les commandes payées
    const orders = await Order.find({ 'items.musicId': { $in: musicIds }, payment: true });
    let totalSales = 0;
    let totalRevenue = 0;
    // Calcul des ventes et revenus par musique
    const salesByMusic = {};
    const revenueByMusic = {};
    musics.forEach(m => { salesByMusic[m._id] = 0; revenueByMusic[m._id] = 0; });
    orders.forEach(order => {
      order.items.forEach(item => {
        if (musicIds.some(id => id.equals(item.musicId))) {
          totalSales += item.quantity || 1;
          // Trouver le prix de la musique
          const music = musics.find(m => m._id.equals(item.musicId));
          if (music) {
            const revenue = (music.price || 0) * (item.quantity || 1);
            totalRevenue += revenue;
            revenueByMusic[item.musicId] = (revenueByMusic[item.musicId] || 0) + revenue;
          }
          salesByMusic[item.musicId] = (salesByMusic[item.musicId] || 0) + (item.quantity || 1);
        }
      });
    });
    // Ajouter les champs sales et revenue à chaque musique
    const musicsWithStats = musics.map(m => {
      const mObj = m.toObject();
      mObj.sales = salesByMusic[m._id] || 0;
      mObj.revenue = revenueByMusic[m._id] || 0;
      return mObj;
    });
    // Top musique (plus vendue)
    let topMusic = null;
    if (musicsWithStats.length > 0) {
      topMusic = musicsWithStats.reduce((max, m) => (m.sales > (max?.sales || 0) ? m : max), musicsWithStats[0]);
    }
    // Streams non gérés (0 par défaut)
    res.json({
      totalTracks: musics.length,
      totalSales,
      totalRevenue,
      totalStreams: 0,
      musics: musicsWithStats,
      topMusic
    });
  } catch (err) {
    res.status(500).json({
      totalTracks: 0,
      totalSales: 0,
      totalRevenue: 0,
      totalStreams: 0,
      musics: [],
      topMusic: null,
      error: 'Erreur serveur.'
    });
  }
});

module.exports = router;
