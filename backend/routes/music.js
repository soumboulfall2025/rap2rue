const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Music = require('../models/Music');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Paydunya = require('paydunya');
const Review = require('../models/Review');

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

const upload = multer();
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
    // Upload cover
    const coverResult = await cloudinary.uploader.upload_stream({
      folder: 'rap2rue/covers', resource_type: 'image'
    }, async (error, result) => {
      if (error) return res.status(500).json({ message: 'Erreur upload cover.' });
      // Upload audio
      const audioResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
          folder: 'rap2rue/audios', resource_type: 'video'
        }, (err, audioRes) => {
          if (err) reject(err);
          else resolve(audioRes);
        }).end(req.files.audio[0].buffer);
      });
      // Création musique
      const music = new Music({
        title,
        genre,
        price,
        description,
        coverUrl: result.secure_url,
        audioUrl: audioResult.secure_url,
        artist: req.user.id,
      });
      await music.save();
      res.status(201).json({ message: 'Musique uploadée !', music });
    });
    // Démarre l'upload cover
    coverResult.end(req.files.cover[0].buffer);
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

module.exports = router;
