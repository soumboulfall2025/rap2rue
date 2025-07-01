const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // adapte le chemin si besoin

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.BACKEND_URL + '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Vérifie si un utilisateur existe déjà avec cet email (inscription classique)
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    if (!email) return done(new Error('Aucun email Google trouvé'), null);
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      // Bloque si un user existe déjà avec cet email (inscription classique)
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return done(new Error('Un compte existe déjà avec cet email. Connecte-toi avec ton mot de passe.'), null);
      }
      user = await User.create({
        name: profile.displayName,
        email,
        googleId: profile.id,
        password: Math.random().toString(36).slice(-8), // mot de passe dummy
        role: undefined, // l'utilisateur choisira après via le frontend
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;
// Facebook désactivé temporairement