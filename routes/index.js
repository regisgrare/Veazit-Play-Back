var express = require('express');
var router = express.Router();

var badgeModel = require('../models/badges')
var userModel = require('../models/users')
var POIModel = require('../models/POI')

//Route pour récupérer l'ensemble des users en BDD
router.get("/best-users", async function (req, res) {
  const bestUserName = await userModel.find().select("username").select("score").select("avatar")
  const user = await userModel.findOne({ token: req.query.token })

  if (user == null) {
    res.json({ bestUserName, result: false })
  } else {
    res.json({ bestUserName, user, result: true })
  }
})

//Route pour actualiser l'User
router.put('/best-users', async function (req, res) {
  var user = await userModel.findOne({ token: req.body.token })
  var result = false
  var infoMessage = ''
  var scorePoi = req.body.score;

  if (user == null) {
    res.json({ user, result })
  } else {

    //Actualisation des lieux déjà visité
    var poi = await POIModel.findOne({ longitude: req.body.longitude, latitude: req.body.latitude })
    if (!poi) {

      var newPoi = new POIModel({
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        category: req.body.category,
      })
      var savePoi = await newPoi.save()

      user.POI.push(savePoi._id)

    } else {
      var userExist = await userModel.findOne({ token: req.body.token, POI: poi._id })
      if (!userExist) {
        user.POI.push(poi._id)
      } else {
        infoMessage = 'Lieu deja visite'
        scorePoi = 0;
      }
    }

    user.score = user.score + parseInt(scorePoi)

    //Actualisation des badges suite à une visite
    const trophy = await badgeModel.find()
    const trophyUser = trophy.filter((trophy) => trophy.condition <= user.score)

    if (user.badges.length == 0) {
      for (let oneTrophy of trophyUser) {
        user.badges.push(oneTrophy._id)
      }
      infoMessage = `Vous venez de gagner des badges.`
    }

    if (user.badges.length != trophyUser.length) {
      var diff = trophyUser.length - user.badges.length
      if (diff > 0) {
        var newTrophy = trophyUser.slice(trophyUser.length - diff, trophyUser.length)
        for (let oneTrophy of newTrophy) {
          user.badges.push(oneTrophy._id)
        }
        if (diff == 1) {
          infoMessage = `Vous venez de gagner un badge.`
        } else {
          infoMessage = `Vous venez de gagner des badges.`
        }
      }
    }

    let userSaved = await user.save()
    result = true
    res.json({ result, userSaved, infoMessage })
  }
})

//Route pour Alimenter la base de données de badges
router.post("/badges", async function (req, res) {
  var newBadge = await new badgeModel({
    title: req.body.title,
    description: req.body.description,
    img: req.body.img
  })

  var saveBadge = await newBadge.save()

  res.json(saveBadge)
})

//Route pour lire les badges en BDD
router.get("/badgesData", async function (req, res) {
  const badgeCollection = await badgeModel.find()
  res.json({ badgeCollection })
})

//Route pour mettre à jour la préférence de l'user en BDD (true ou false)
router.put('/update-theme', async function (req, res) {
  var token = req.body.token
  var apparence = req.body.apparence
  var user = await userModel.findOne({ token: token })

  if (user == null) {
    res.json({ result: false })
  } else {

    await userModel.updateOne({ token: token }, { apparence: apparence });
    res.json({ result: true })
  }
})

//Route pour lire les badges d'un user
router.get('/my-badges', async function (req, res) {
  var user = await userModel.findOne({ token: req.query.token })
  var result = false
  if (user) {
    const myBadge = await userModel.findOne({ token: req.query.token }).populate('badges')
    result = true
    res.json({ myBadge: myBadge.badges, result })
  } else {
    res.json({ result })
  }
})

//Route pour mettre à jour les favoris d'un user
router.put('/add-favorite', async function (req, res) {
  var user = await userModel.findOne({ token: req.body.token })
  var result = false

  if (user) {
    var poi = await POIModel.findOne({ longitude: req.body.longitude, latitude: req.body.latitude })
    if (!poi) {

      var newPoi = new POIModel({
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        category: req.body.category,
      })
      var savePoi = await newPoi.save()

      user.favoritePOI.push(savePoi._id)

    } else {
      var userExist = await userModel.findOne({ token: req.body.token, favoritePOI: poi._id })
      if (!userExist) {
        user.favoritePOI.push(poi._id)
      }
    }
    let userSaved = await user.save()
    result = true
    res.json({ result, userSaved })
  } else {
    res.json({ result })
  }
})

//Route pour lire les favoris d'un user
router.get('/my-favorite', async function (req, res) {
  var user = await userModel.findOne({ token: req.query.token })
  var result = false
  if (user) {
    const myFavorite = await userModel.findOne({ token: req.query.token }).populate('favoritePOI')
    result = true
    res.json({ myFavorite: myFavorite.favoritePOI, result })
  } else {
    res.json({ result })
  }
})

//Route pour lire les anciennes visites d'un user
router.get('/my-archive', async function (req, res) {
  var user = await userModel.findOne({ token: req.query.token })
  var result = false
  if (user) {
    const myArchive = await userModel.findOne({ token: req.query.token }).populate('POI')
    result = true
    res.json({ myArchive: myArchive.POI, result })
  } else {
    res.json({ result })
  }
})

//Route pour supprimer un favori d'un user
router.delete('/delete-favorite/:identifiant/:token', async function (req, res, next) {
  var usersFavorite = await userModel.find({ favoritePOI: req.params.identifiant })
  var usersPoi = await userModel.find({ POI: req.params.identifiant })

  var user = await userModel.findOne({ token: req.params.token })
  var pos = user.favoritePOI.indexOf(req.params.identifiant)

  if (usersFavorite.length >= 1 && usersPoi.length > 0) {
    user.favoritePOI.splice(pos, 1)
    await user.save()
  } else {
    user.favoritePOI.splice(pos, 1)
    var favorite = await POIModel.deleteOne({ _id: req.params.identifiant })
    await user.save()
  }
  var myFavorite = await userModel.findOne({ token: req.params.token }).populate('favoritePOI')

  res.json({ result: true, myFavorite: myFavorite.favoritePOI })
})

module.exports = router;
