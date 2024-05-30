

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  FirstName: String,
  LastName: String,

});

const User = mongoose.model('User', userSchema,'User');

module.exports = User;
