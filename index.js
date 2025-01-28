const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Email = require('./models/Email');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
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

// Routes
app.post('/api/emails', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const emailExists = await Email.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ error: 'This email is already registered' });
    }

    const newEmail = new Email({ email });
    await newEmail.save();

    res.json({ success: true, message: 'Email successfully registered' });
  } catch (error) {
    console.error('Error registering email:', error);
    res.status(500).json({ error: 'Error registering email', detail: error.message });
  }
});

app.get('/api/emails', async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Error fetching emails', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
