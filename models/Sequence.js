const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema({
  year: String,
  month: String,
  sequence: Number,
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

module.exports = Sequence;
