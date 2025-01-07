const { verify } = require('jsonwebtoken');
const mongoose = require('mongoose')

// USER SCHEMA
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
  },
  password: {type: String, required: true, minlength: 8,},
  verifyOTP: {type: String, default: ''},
  verifyOTPExpireAt: {type: Number, default: 0},
  isAccountVerified: {type: Boolean, default: false},
  resetOTP: {type: String, default: ''},
  resetOPTExpireAt: {type: Number, default: 0},
  ccreatedAt: {type: Date, default: Date.now,},
  updatedAt: {type: Date, default: Date.now,}
});

// MODEL EXPORT
const userModel = mongoose.Model.users || mongoose.model('users', userSchema)

module.exports = userModel
