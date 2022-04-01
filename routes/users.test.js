var app = require("../app")
var request = require("supertest")

test("Joueur déjà inscrit", async () => {
  await request(app).post('/sign-up')
    .send({ email: 'nicolas@veazit.fr', password: 'nicolas' })
    .expect({ errorMsg: 'Joueur déjà présent en Base de Données' })
});

