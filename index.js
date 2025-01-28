const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Email = require('./models/Email'); // Modèle Email

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS
app.use(cors({
  origin: [
    "https://www.myminima.fr", // Domaine frontend
    "http://www.myminima.fr", // Variante HTTP
    "https://www.minima-front-uni.vercel.app" // Domaine Vercel
  ],
  credentials: true, // Si vous envoyez des cookies
}));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connecté à MongoDB');
}).catch((err) => {
  console.error('❌ Erreur de connexion à MongoDB :', err.message);
  process.exit(1);
});

// Routes API
app.post('/emails', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: 'Cet email est déjà inscrit' });
    }

    const newEmail = new Email({ email });
    await newEmail.save();

    return res.status(201).json({ message: 'Email enregistré avec succès' });
  } catch (error) {
    console.error('Erreur dans POST /api/emails :', error.message);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

app.get('/emails', async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.status(200).json(emails);
  } catch (error) {
    console.error('Erreur dans GET /api/emails :', error.message);
    res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
});

// Endpoint de test (santé de l'API)
app.get('/api/ping', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d’exécution sur le port ${PORT}`);
});
