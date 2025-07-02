require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Music = require('./models/Music');

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  await mongoose.connect(MONGO_URI);

  const artists = await User.find({ role: 'artist' });
  const artistIds = artists.map(a => a._id.toString());

  const musics = await Music.find();
  let errors = 0;

  for (const music of musics) {
    // On prend l'id de l'artiste (champ artist ou artistId)
    const artistId = music.artist?._id?.toString() || music.artistId?.toString();
    if (!artistId || !artistIds.includes(artistId)) {
      console.log(`❌ Musique "${music.title}" référence un artiste inexistant : ${artistId}`);
      errors++;
      // Correction automatique : assigne le premier artiste existant
      if (artists[0]) {
        music.artist = artists[0]._id;
        await music.save();
        console.log(`✅ Correction : assigné à l'artiste ${artists[0].name}`);
      }
    }
  }

  if (errors === 0) {
    console.log('✅ Toutes les musiques référencent un artiste existant.');
  } else {
    console.log(`⚠️ ${errors} musiques corrigées.`);
  }

  await mongoose.disconnect();
}

main();
