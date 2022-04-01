var mongoose = require('mongoose');
//Connexion à la BDD
var options = {
    connectTimeoutMS: 5000,
    useUnifiedTopology: true,
    useNewUrlParser: true,
}

mongoose.connect(process.env.BDD_URL,
    options,
    function (err) {
        if (err) {
            console.log(err, 'failed to connect to the database because');
        } else {
            console.log(' Database Veazit connection : Success ');
        }
    }
);

module.exports = mongoose