// Connexion serveur
var express = require('express');
var app = express();
var port = process.env.port || 8000; //8000 étant le port par défaut
var server = app.listen(port);
var io = require('socket.io')(server);
var connection = require('./connectDatabase').connection;

// Gestion evenements
io.sockets.on('connection', function (socket) {
    console.log('Un nouveau client est connecté !');
    socket.emit('onTestString', 'test');
    socket.emit('onTestJson', {"cheval":"valcheval","canard":"valcanard","chien":"valchien","chat":"valchat"});
    socket.emit('onTestJsonArray', [{"prénom":"Jimmy", "nomDeFamille":"Lopez"}, {"prénom":"Michel", "nomDeFamille":"Dupond"}, {"prénom":"Christophe", "nomDeFamille":"Dony"}]);

    socket.user = 0;

    // TryInscription permet d'inscrire user (JsonObject). Retourne vrai si réussi, faux sinon.
    socket.on('TrySignUp', function (user) {
      /*var newUser = new User(user.email, user.nickname, user.password, user.birthday, user.phoneNumber, user.description, user.photo)
      db.addUser(newUser);
      socket.emit("RTrySignUp", 1) //résultat renvoyé dépend des instructions sql futures*/
      console.log('Je passe dans trysignup');
    });
});
