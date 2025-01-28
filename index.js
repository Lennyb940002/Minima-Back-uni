// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Email = require('./models/Email');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(cors({
  origin: [
    "https://www.myminima.fr",
  ],
  credentials: true,
  exposedHeaders: ["set-cookie"],
}));
app.use(express.json());

// Routes
app.post('/api/emails', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const emailExists = await Email.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ error: 'Cet email est déjà inscrit' });
    }

    const newEmail = new Email({ email });
    await newEmail.save();

    res.json({ success: true, message: 'Email enregistré avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'email:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'email', detail: error });
  }
});

app.get('/api/emails', async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.json(emails);
  } catch (error) {
    console.error('Erreur lors de la lecture des emails:', error);
    res.status(500).json({ error: 'Erreur lors de la lecture des emails' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
