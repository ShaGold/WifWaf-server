var express = require('express');
var app = express();
var port = process.env.port || 8000; //8000 étant le port par défaut
var server = app.listen(port);
var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {
    console.log('Un nouveau client est connecté !');
    socket.emit('onTest', 'test');
    socket.user = 0;

    // TryInscription permet d'inscrire user (JsonObject). Retourne vrai si réussi, faux sinon.
    socket.on('TrySignUp', function (user) {
      /*var newUser = new User(user.email, user.nickname, user.password, user.birthday, user.phoneNumber, user.description, user.photo)
      db.addUser(newUser);
      socket.emit("RTrySignUp", 1) //résultat renvoyé dépend des instructions sql futures*/
      console.log('Je passe dans trysignup');
    });
});
