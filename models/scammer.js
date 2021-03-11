const mongoose = require('mongoose');

//bootcamp schema
const Scammer = new mongoose.Schema({
  scammer: String
});

module.exports = mongoose.model('scammers', Scammer);
