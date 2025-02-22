const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    }, // Will be empty for Google sign-in users
    isGoogleUser: { type: Boolean, default: false }

})

const userModel = mongoose.model('sociallogins', UserSchema);
module.exports = userModel;