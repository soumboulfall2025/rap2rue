// Backend Express de RAP2RUE
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://rap2rue-frontend.onrender.com'
    ],
    credentials: true
  }
});
app.set('io', io);
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const musicRoutes = require('./routes/music');
const paymentRoutes = require('./routes/payment');
const videoRoutes = require('./routes/video');
const userRoutes = require('./routes/user');
const allowedOrigins = [
  'http://localhost:5173',
  'https://rap2rue-frontend.onrender.com'
];

app.use(cors({
  origin: function(origin, callback){
    // autorise les requêtes sans origin (ex. Postman) ou si l'origine est dans allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// Augmente la limite à 50mb pour les uploads volumineux
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.send('API RAP2RUE opérationnelle');
});

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/user', userRoutes);
// --- ROUTES ADMIN ---
app.use('/api/admin', require('./routes/admin'));

const passport = require('./config/passport');
app.use(passport.initialize());

// ... routes à venir (artistes, musiques, achats, etc.)

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => console.log(`Serveur backend + WebSocket lancé sur le port ${PORT}`));
  })
  .catch(err => console.error('Erreur MongoDB :', err));

// Socket.IO events de base (optionnel)
io.on('connection', (socket) => {
  console.log('Client connecté au WebSocket');
});

// --- UX MOBILE : loader plein écran lors des actions importantes ---
// Ajout d'un composant Loader global (à placer dans App.jsx ou un composant Layout)
// Exemple d'intégration :
// {loading && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200]">
//   <div className="loader"></div>
// </div>}
//
// Ajoute ce CSS dans App.css :
// .loader {
//   border: 8px solid #232323;
//   border-top: 8px solid #1db954;
//   border-radius: 50%;
//   width: 60px;
//   height: 60px;
//   animation: spin 1s linear infinite;
// }
// @keyframes spin { 100% { transform: rotate(360deg); } }
