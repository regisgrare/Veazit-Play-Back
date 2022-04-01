var mongoose = require('mongoose')
//Création d'un schéma pour les users avec clefs étrangères pour badges, POI et POI Favoris
userSchema = mongoose.Schema({
    token: String,
    username: String,
    email: String,
    password: String,
    score: Number,
    avatar: String,
    googleConnect: Boolean,
    apparence: Boolean,
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'badges' }],
    POI: [{ type: mongoose.Schema.Types.ObjectId, ref: 'POIS' }],
    favoritePOI: [{ type: mongoose.Schema.Types.ObjectId, ref: 'POIS' }],
})

var userModel = mongoose.model('users', userSchema)

module.exports = userModel;

