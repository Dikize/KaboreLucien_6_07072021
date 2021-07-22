const mongoose = require('mongoose');
const mongoUniqueValidator = require('mongoose-unique-validator');

// Création du model User pour le stockage dans la base de données
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
});

// Plusieurs utilisateurs ne peuvent pas s'inscrivent avec le même mail
userSchema.plugin(mongoUniqueValidator);

module.exports = mongoose.model('User', userSchema);