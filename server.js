// Connexion serveur
var express = require('express');
var app = express();
var port = process.env.port || 8000; //8000 étant le port par défaut
var server = app.listen(port);
var io = require('socket.io')(server);

var db = require('./connectDatabase').connection;
var User = require('./controllers/User.js').user;
var Dog = require('./controllers/Dog.js').dog;
var Walk = require('./controllers/Walk.js').walk;
var Locations = require('./controllers/Location.js').locations;

// Gestion evenements
io.sockets.on('connection', function (socket) {
    //TESTS--------------------------------------------------------------------------------------------------------------------
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

    //INSCRIPTION-CONNEXION----------------------------------------------------------------------------------------------------
    socket.on('TrySignUp', function (user) {
        var newUser = new User(0, user.email, user.nickname, user.password, user.birthday, user.phoneNumber, user.description, user.photo);
        console.log('Je passe dans trysignup');
        console.log(newUser);
        db.addUser(newUser, socket);
    });

    socket.on('TrySignIn', function(user) {
        var email = user.email;
        db.getUserByEmail("RTrySignIn", email, socket);
    });

    //GESTION CHIENS------------------------------------------------------------------------------------------------------------
    socket.on('TryAddDog', function (dog) {
        var newDog = new Dog(0, dog.dogName, dog.idUser, dog.age, dog.breed, dog.size, dog.getAlongWithMales, dog.getAlongWithFemales, dog.getAlongWithKids, dog.getAlongWithHumans, dog.description, dog.gender, dog.photo);
        db.addDog(newDog, socket, dog.behaviours);
    });

    socket.on('getAllMyDogs', function(idUser){
        console.log('Récupération de tous les chiens');
        db.getAllMyDogs(idUser, socket);
    });

    socket.on('deleteDog', function(idDog){
        console.log('Suppression chien ', idDog);
        db.deleteDog(idDog, socket);
    });

    socket.on('getDogsForIdWalk', function(idWalk){
        console.log('Récupération de tous les chiens dans la balade ', idWalk);
        db.getDogsForIdWalk(idWalk, socket);
    });

    socket.on('getDogById', function(idDog){
        console.log('Récupération de toutes les données pour le chien dont l id est', idDog);
        db.getDogById(idDog, socket);
    });

    //GESTION CARACTERE CHIEN----------------------------------------------------------------------------------------------------
    socket.on('getAllBehaviours', function(){
        console.log('Récupération de tous les Behaviour');
        db.getAllBehaviours(socket);
    });

    //GESTION BALADES----------------------------------------------------------------------------------------------------------
    socket.on('deleteWalk', function(idWalk){
        console.log('Suppression balade ', idWalk);
        db.deleteWalk(idWalk, socket);
    });

    socket.on('TryAddWalk', function(walk){
        console.log('Tentative insertion de balade', walk);
        var newWalk = new Walk(0, walk.idUser, walk.walkName, walk.description, walk.city, walk.departure);
        db.addWalk(newWalk, walk.dogs, walk.location, socket);
        db.getAllTokens();
    });

    socket.on('getAllMyWalks', function(idUser){
        db.getAllMyWalks(idUser, socket);
    });

    socket.on('getAllWalks', function(){
        db.getAllWalks(socket);
    });

    //GESTION USER---------------------------------------------------------------------------------------------------------------
    socket.on('getUserById', function(idUser){
        console.log("Tentative de récupération du user à partir de l'id", idUser);
        db.getUserById(idUser, socket);
    });

    socket.on('updateUser', function(user){
        console.log("Update user", user);
        console.log("Update photo", user.photo);
        var newUser = new User(user.idUser, user.email, user.nickname, user.password, user.birthday, user.phoneNumber, user.description, user.photo);
        db.updateUser(newUser, socket);
    });

    socket.on('updateDog', function(dog){
        console.log("Update dog", dog);
        var newDog = new Dog(dog.idDog, dog.dogName, dog.idUser, dog.age, dog.breed, dog.size, dog.getAlongWithMales, dog.getAlongWithFemales, dog.getAlongWithKids, dog.getAlongWithHumans, dog.description, dog.gender, dog.photo);
        db.updateDog(newDog, socket, dog.behaviours);
    });

    socket.on('updateWalk', function(walk){
        console.log("Update walk", walk);
        var newWalk = new Walk(walk.idWalk, walk.idUser, walk.walkName, walk.description, walk.city, walk.departure);
        db.updateWalk(newWalk, socket, walk.dogs);
    });

    socket.on('token', function(token){
        db.addToken(token);
    });

    socket.on('addParticipation', function(participation){
        console.log("Toutes les participations reçues", participation);
        for(p in participation){
            console.log("J'appele addParticipation sur ", participation[p]);
            db.addParticipation(participation[p], socket);
        }
    });

    socket.on('getAllParticipationsForIdWalk', function(idWalk){
            console.log("J'appele getAllParticipations pour la balade ", idWalk);
            db.getAllParticipationsForIdWalk(idWalk, socket);
    });

    socket.on('getAllParticipationsForIdUser', function(idUser){
            console.log("J'appele getAllParticipations pour l'utilisateur ", idUser);
            db.getAllParticipationsForIdUser(idUser, socket);
    });


    socket.on('validateParticipations', function(participations){
            console.log("Participants à accepter : ", participations)
            for(p in participations){
                console.log("Je valide la participation ", participations[p]);
                db.setParticipationToValidated(participations[p], socket);
            }
    });

    socket.on('refuseParticipations', function(participations){
            console.log("Participants à refuser :", participations)
            for(p in participations){
                console.log("Je refuse la participation ", participations[p]);
                db.setParticipationToRefused(participations[p], socket);
            }
    });

    //Gestion shake
    socket.on('randomWalk', function(){
        //devra emit RrandomWalk
        db.getRandomWalk(socket);
    });

    socket.on('randomDog', function(){
        //devra emit RrandomWalk
        db.getRandomDog(socket);
    });
});
