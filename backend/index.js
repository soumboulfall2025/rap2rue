// Backend Express de RAP2RUE
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const musicRoutes = require('./routes/music');
const paymentRoutes = require('./routes/payment');

app.use(cors({
  origin: 'https://rap2rue-frontend.onrender.com', // ou '*' pour tout autoriser (moins sécurisé)
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API RAP2RUE opérationnelle');
});

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/payment', paymentRoutes);
// --- ROUTES ADMIN ---
app.use('/api/admin', require('./routes/admin'));

// ... routes à venir (artistes, musiques, achats, etc.)

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Serveur backend lancé sur le port ${PORT}`));
  })
  .catch(err => console.error('Erreur MongoDB :', err));
