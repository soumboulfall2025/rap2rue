const paydunya = require('paydunya');
const dotenv = require('dotenv');
dotenv.config();

const setup = new paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY,
  token: process.env.PAYDUNYA_TOKEN,
  mode: 'live', // ou 'test' selon l'environnement
});

const store = new paydunya.Store({
  name: 'RAP2RUE',
  tagline: 'La plateforme rap la plus street',
  phone_number: '787203975',
  postal_address: 'Dakar, Sénégal',
  websiteUrl: 'https://rap2rue.com',
  logoUrl: 'https://rap2rue.com/logo.png', // à adapter
});

module.exports = { setup, store };
