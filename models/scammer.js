const mongoose = require('mongoose');

//bootcamp schema
const Scammer = new mongoose.Schema({
  scammer: {
    type: String,
    lowercase: true,
    trim: true
  }
});

module.exports = mongoose.model('scammers', Scammer);
