var mongoose = require('mongoose')
//Création d'un schéma pour les badges
badgeSchema = mongoose.Schema({
    title: String,
    description: String,
    img: String,
    condition: Number,
})

var badgeModel = mongoose.model('badges', badgeSchema)

module.exports = badgeModel;

