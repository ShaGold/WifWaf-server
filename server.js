// Connexion serveur
var express = require('express');
var app = express();
var port = process.env.port || 8000; //8000 étant le port par défaut
var server = app.listen(port);
var io = require('socket.io')(server);

var connection = require('./connectDatabase').connection;
var User = require('./controllers/user.js').user;

// Gestion evenements
io.sockets.on('connection', function (socket) {
    console.log('Un nouveau client est connecté !');
    socket.emit('onTestString', 'test');
    socket.emit('onTestJson', {"cheval":"valcheval","canard":"valcanard","chien":"valchien","chat":"valchat"});
    socket.emit('onTestJsonArray', [{"prénom":"Jimmy", "nomDeFamille":"Lopez"}, {"prénom":"Christophe", "nomDeFamille":"Dony"}]);
    socket.user = 0;

    socket.on('onTestSendString', function (paramTest){
      console.log('Passage dans onTestSendString: ', paramTest);
    });

    socket.on('onTestSendJson', function (paramTest){
      console.log('Passage dans onTestSendJson: ', paramTest);
      console.log('valeur du champ mail:', paramTest.email);
      console.log('valeur du champ nom:', paramTest.name);
      //TODO création d'un objet user avec les valeurs récupérées
    });

    socket.on('onTestSendJsonArray',function (paramTest){
        console.log('Passage dans onTestSendJsonArray: ', paramTest);
        var jsonData = JSON.parse(paramTest);
        for ( var i = 0; i < jsonData.length; i++) {
            console.log(jsonData[i].prenom);
            console.log(jsonData[i].nom);
        }
    });

    // TryInscription permet d'inscrire user (JsonObject). Retourne vrai si réussi, faux sinon.
    socket.on('TrySignUp', function (user) {
        var newUser = new User(user.email, user.nickname, user.password, user.birthday, user.phoneNumber, user.description, user.photo);
        //db.addUser(newUser);
        //socket.emit("RTrySignUp", 1) //résultat renvoyé dépend des instructions sql futures*/
        console.log('Je passe dans trysignup');
        console.log(newUser);
    });
});
