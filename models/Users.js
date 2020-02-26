const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: { type: String, default: ''},
    email: { type: String, unique: true, default: ''},
    password: { type: String, default: ''}
});

module.exports = mongoose.model('user', UserSchema);