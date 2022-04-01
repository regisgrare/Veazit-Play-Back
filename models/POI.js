var mongoose = require('mongoose')
//Création d'un schéma pour les POI
POISchema = mongoose.Schema({
    latitude: Number,
    longitude: Number,
    title: String,
    description: String,
    image: String,
    category: String,
})

var POIModel = mongoose.model('POIS', POISchema)

module.exports = POIModel;

