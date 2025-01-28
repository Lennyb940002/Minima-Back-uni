const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'L’email est obligatoire'],
    unique: true,
    match: [/.+\@.+\..+/, 'Veuillez entrer un email valide'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Email', emailSchema);
