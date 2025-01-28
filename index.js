const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Email = require('./models/Email'); // Assurez-vous que ce chemin est correct
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting server...');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit the process if unable to connect to MongoDB
});

app.use(cors({
  origin: [
    "https://www.myminima.fr",
  ],
  credentials: true,
  exposedHeaders: ["set-cookie"],
}));
app.use(express.json());

console.log('Middleware setup complete.');

// Routes
app.post('/api/emails', async (req, res) => {
  console.log('POST /api/emails called');
  try {
    const { email } = req.body;
    console.log('Received email:', email);

    if (!email || !email.includes('@')) {
      console.error('Invalid email:', email);
      return res.status(400).json({ error: 'Email invalide' });
    }

    const emailExists = await Email.findOne({ email });
    if (emailExists) {
      console.error('Email already exists:', email);
      return res.status(409).json({ error: 'Cet email est déjà inscrit' });
    }

    const newEmail = new Email({ email });
    await newEmail.save();
    console.log('Email saved:', email);

    res.json({ success: true, message: 'Email enregistré avec succès' });
  } catch (error) {
    console.error('Error registering email:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'email', detail: error.message });
  }
});

app.get('/api/emails', async (req, res) => {
  console.log('GET /api/emails called');
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    console.log('Fetched emails:', emails);
    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Erreur lors de la lecture des emails', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
