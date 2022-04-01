var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var uid2 = require('uid2');

var userModel = require('../models/users')

/* SIGN UP pour enregistrement New User*/
router.post('/sign-up', async function (req, res) {

  var error = []
  var result = false
  var regexMail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  if (regexMail.test(req.body.emailFromFront)) {

    const data = await userModel.findOne({
      email: req.body.emailFromFront
    })

    if (data != null) {
      error.push('Joueur déjà présent en Base de Données')
    }

    if (req.body.usernameFromFront == ''
      || req.body.emailFromFront == ''
      || req.body.passwordFromFront == ''
    ) {
      error.push('Merci de remplir tous les champs')
    }

    if (error.length == 0) {
      var hashPassword = bcrypt.hashSync(req.body.passwordFromFront, 10);
      var newUser = new userModel({
        username: req.body.usernameFromFront,
        email: req.body.emailFromFront,
        password: hashPassword,
        token: uid2(32),
        score: 0,
        apparence: false,
        googleConnect: false,
        avatar: 'https://res.cloudinary.com/dualrskkc/image/upload/v1646863162/veazit/anonymous_ra8ndn.png'
      })

      var saveUser = await newUser.save()
      result = true;
    }
  } else {
    error.push('Veuillez indiquer un mail')
  }
  res.json({ result, saveUser, error })
});

/* SIGN IN pour connexion User*/
//Modification user res.json uniquement s'il c'est connecté
router.post('/sign-in', async function (req, res) {
  let result = false;
  let error = [];

  var user = await userModel.findOne({ email: req.body.emailFromFront })

  if (user && !user.googleConnect) {
    if (bcrypt.compareSync(req.body.passwordFromFront, user.password)) {
      result = true
    } else {
      error.push("Tu t'es trompé de Mot de Passe !");
    }
  } else if (user && user.googleConnect) {
    error.push('Joueur deja inscrit avec Google');
  } else {
    if (!req.body.passwordFromFront || !req.body.emailFromFront) {
      error.push('Merci de remplir tous les champs');
    } else {
      error.push("Joueur non existant, inscris toi vite !");
    }

  }
  res.json({ result, user, error })
});

//Sign-in Sign-up d'un user via google
//cet user ne possède pas de password
router.post('/google-connect', async function (req, res) {
  let result = false
  let infoConnect = 'Inscription'
  let error = ''

  let email = req.body.email
  let photoUrl = req.body.photoUrl
  let pseudo = req.body.name

  let user = await userModel.findOne({ email: email })

  if (user != null && user.googleConnect) { //juste le connecter

    infoConnect = 'Connexion'
    result = true

  } else if (user == null) {  //creer l'utilisateur en BDD

    var newUser = new userModel({
      username: pseudo,
      email: email,
      token: uid2(32),
      score: 0,
      avatar: photoUrl,
      googleConnect: true,
      apparence: false,
    })

    user = await newUser.save()
    result = true

  } else {
    error = 'Joueur deja inscrit sans Google'
  }
  res.json({ result, infoConnect, user, error })
})

module.exports = router;
