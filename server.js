// Connexion serveur
var express = require('express');
var app = express();
var port = process.env.port || 8000; //8000 étant le port par défaut
var server = app.listen(port);
var io = require('socket.io')(server);

var db = require('./connectDatabase').connection;
var User = require('./controllers/User.js').user;
var Dog = require('./controllers/Dog.js').dog;

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
    });

    socket.on('onTestSendJsonArray',function (paramTest){
        console.log('Passage dans onTestSendJsonArray: ', paramTest);
        for ( var i = 0; i < paramTest.length; i++) {
            console.log(paramTest[i].prenom);
            console.log(paramTest[i].nom);
        }
    });

    socket.on('TrySignUp', function (user) {
        var newUser = new User(0, user.email, user.nickname, user.password, user.birthday, user.phoneNumber, user.description, user.photo);
        console.log('Je passe dans trysignup');
        console.log(newUser);
        db.addUser(newUser, socket);
    });

    socket.on('TryAddDog', function (dog) {
        console.log(dog);
        var newDog = new Dog(0, dog.dogName, dog.idUser, dog.age, dog.breed, dog.size, dog.getAlongWithMales, dog.getAlongWithFemales, dog.getAlongWithKids, dog.getAlongWithHumans, dog.description);
        console.log('Je passe dans TryAddDog');
        console.log(newDog);
        db.addDog(newDog, socket);
    });

    socket.on('getAllMyDogs', function(idUser){
        console.log('Récupération de tous les chiens');
        db.getAllMyDogs(idUser, socket);
    });

    socket.on('getAllBehaviours', function(){
        console.log('Récupération de tous les Behaviour');
        db.getAllBehaviours(socket);
    });

    socket.on('TrySignIn', function(user) {
        var email = user.email;
        var mdp = user.mdp;
        db.getUserByEmail("RTrySignIn", email, socket);
    });
});
