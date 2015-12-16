var mysql = require('mysql');

var User = require('./controllers/User.js').user;

var util = require('util');

module.exports.connection = new DBConnection();

function DBConnection(){
  var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'WifWaf'
  });

  var self = this;

  db.connect();

  db.query('SELECT * FROM Behaviour', function(err, rows, fields) {
    //if (err) throw err;
    console.log('Résultat: ', rows[0].description);
  });

  /*db.query('INSERT INTO Behaviour(description) VALUES (\'calm\')', function(err, rows, fields) {
    if (err) throw err;
});*/

  this.addUser = function(user, socket){
    var req = "INSERT INTO User(email, nickname, password, birthday, phoneNumber, description, photo) "
                 + "VALUES('" + user.email + "', '" + user.nickname + "', '" + user.password + "', '"
                 + user.birthday + "', '" + user.phoneNumber + "', '" + user.description + "', '" + user.photo + "');";
     db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             var jsonUser = {
                 id : -err['errno']
             };
             socket.emit("RTrySignUp", jsonUser);
         }
         else{
             self.getUserByEmail("RTrySignUp", user.email, socket);
         }
     });
  };

    this.getUserByEmail = function(event, email, socket){
         db.query("SELECT * FROM User Where email = '" + email + "';", function(err, rows, fields) {
             if (rows.length == 0){
                 var jsonUser = {
                     id : -1,
                     email : "null",
                     nickname : "null",
                     password : "null",
                     birthday : "null",
                     phoneNumber : "",
                     description : "",
                     photo : "",
                     flag : ""
                 };
             }
             else{
                 var jsonUser = {
                     id : rows[0].idUser,
                     email : rows[0].email,
                     nickname : rows[0].nickname,
                     password : rows[0].password,
                     birthday : rows[0].birthday,
                     phoneNumber : rows[0].phoneNumber,
                     description : rows[0].description,
                     photo : rows[0].photo,
                     flag : rows[0].flag
                 };
             }
             socket.emit(event, jsonUser);
         });
    };

  this.addDog = function(dog, socket){
      var req = "INSERT INTO Dog(dogName, idUser, age, breed, size, getAlongWithMales, getAlongWithFemales, getAlongWithKids, getAlongWithHumans, description) "
                 + "VALUES('" + dog.dogName + "', '" + dog.idUser + "', '" + dog.age + "', '" + dog.breed + "', '"
                 + dog.size + "', '" + dog.getAlongWithMales + "', '" + dog.getAlongWithFemales + "', '"
                 + dog.getAlongWithKids + "', '" + dog.getAlongWithHumans +  "', '" + dog.description + "');";
      db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             return;
         }
         else{
             socket.emit("RTryAddDog");
         }
    });
  };

  this.addWalk = function(walk, socket){
      var req = "INSERT INTO Walk(city, idDog, idUser, walkName, description, departure) "
                 + "VALUES('" + walk.city + "', '" + walk.idDog + "', '" + walk.idUser + "', '" + walk.walkName + "', '"
                 + walk.description + "', '" + walk.departure + "');";
      db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             return;
         }
         else{
             socket.emit("RTryAddWalk");
         }
    });
  };

  this.addLocation = function(location, socket){
      var req = "INSERT INTO Location(idWalk, lattitude, longitude, ordering) "
                 + "VALUES(LAST_INSERT_ID(), '" + location.lattitude + "', '" + location.longitude + "', '" + location.ordering + "');";
                 console.log(req);
      db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             return;
         }
         else{
             console.log("c'est bon");
         }
    });
  };

  this.getAllMyDogs = function(idUser, socket){
      var req = "SELECT * FROM Dog WHERE idUser = " + idUser + ";";
      db.query(req, function select(err, result) {
          if (err) {
              console.log(err);
              socket.emit("RGetAllMyDogs", err['errno']);
          }
          else{
              console.log("Les chiens: ", result);
              socket.emit("RGetAllMyDogs", result);
          }
      });
  };

  this.getAllBehaviours = function(socket){
      var req = "SELECT * FROM Behaviour;";
      db.query(req, function select(err, result) {
          if (err) {
              console.log(err);
              socket.emit("RGetAllBehaviours", err['errno']);
          }
          else{
              socket.emit("RGetAllBehaviours", result);
          }
      });
  };

  this.deleteDog = function(idDog, socket){
      console.log(idDog);
      db.query("DELETE FROM Dog WHERE Dog.idDog = " + idDog + ";", function(err, rows, fields) {
        console.log(err);
      });
      socket.emit("RdeleteDog");
  };

  this.getAllMyWalks = function(idUser, socket){
      var req = "SELECT * FROM Walk WHERE idUser = " + idUser + ";";
      db.query(req, function select(err, result) {
          if (err) {
              console.log(err);
              socket.emit("RGetAllMyWalks", err['errno']);
          }
          else{
              var resultat = result;
              var l;
              for(i = 0; i<result.length; i++){
                  var req = "SELECT * FROM Location WHERE idWalk = " + result[i]['idWalk'] + " ORDER BY ordering;";
                  db.query(req, function select(err, resultLoc) {
                      if (err) {
                          console.log(err);
                          socket.emit("RGetAllMyWalks", err['errno']);
                      }
                      else{
                          resultat[i].path = resultLoc;
                          console.log("Balade modifiée : " + util.inspect(resultat[i]));
                          console.log("id balade:" + result[i].idWalk);
                          console.log("longueur result" + result.length);
                          if (i == result.length - 1){
                              //dernier element
                              console.log("DERNIER ELEMENT");
                              console.log("Resultat final", resultat);
                          }
                      }
                  });
              }

              //socket.emit("RGetAllMyWalks", result);
          }
      });
  };

}
