var mysql = require('mysql');

var User = require('./controllers/User.js').user;

var util = require('util');

var Locations = require('./controllers/Location.js').locations;

var fs = require('fs');

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
    var req = "INSERT INTO User(email, nickname, password, birthday, phoneNumber, description) "
                 + "VALUES('" + user.email + "', '" + user.nickname + "', '" + user.password + "', '"
                 + user.birthday + "', '" + user.phoneNumber + "', '" + user.description + "');";
     db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             var jsonUser = {
                 id : -err['errno']
             };
             socket.emit("RTrySignUp", jsonUser);
         }
         else{
             if (user.photo != null) {
                    var img = new Buffer(user.photo, 'base64');

                    /*Récupération id*/
                    var req = "SELECT LAST_INSERT_ID();";
                    db.query(req, function select(err, result) {
                       if (err) {
                           console.log(err);
                           return;
                       }
                       else{
                           var lastid = result[0]['LAST_INSERT_ID()'];
                           fs.writeFile('img/profil_' + lastid + '.jpg', img, function (err) {
                               if (err){
                                   console.log(err);
                               }
                               console.log('Photo saved');
                           });
                       }
                   });
             }
             self.getUserByEmail("RTrySignUp", user.email, socket);
         }
     });
  };

    this.getUserByEmail = function(event, email, socket){
         db.query("SELECT * FROM User Where email = '" + email + "';", function(err, rows, fields) {
             if (rows.length == 0){
                 var jsonUser = {
                     idUser : -1,
                     email : "null",
                     nickname : "null",
                     password : "null",
                     birthday : "null",
                     phoneNumber : "",
                     description : "",
                     photo : "",
                     flag : ""
                 };
                 socket.emit(event, jsonUser);
             }
             else{
                 //récupération de la photo
                 fs.readFile('img/profil_' + rows[0].idUser +  '.jpg', function (err, data) {
                   if (err) {
                       fs.readFile('img/user.jpg', function (err, data) {
                           var image = new Buffer(data).toString('base64');
                           var jsonUser = {
                                 idUser : rows[0].idUser,
                                 email : rows[0].email,
                                 nickname : rows[0].nickname,
                                 password : rows[0].password,
                                 birthday : rows[0].birthday,
                                 phoneNumber : rows[0].phoneNumber,
                                 description : rows[0].description,
                                 photo : image,
                                 flag : rows[0].flag
                             };
                             socket.emit(event, jsonUser);
                       });
                   }
                   else {
                       var image = new Buffer(data).toString('base64');
                       var jsonUser = {
                             idUser : rows[0].idUser,
                             email : rows[0].email,
                             nickname : rows[0].nickname,
                             password : rows[0].password,
                             birthday : rows[0].birthday,
                             phoneNumber : rows[0].phoneNumber,
                             description : rows[0].description,
                             photo : image,
                             flag : rows[0].flag
                         };
                         socket.emit(event, jsonUser);
                   }
                });
            }
    });
    };

  this.addDog = function(dog, socket, behaviours){
      var req = "INSERT INTO Dog(dogName, idUser, age, breed, size, getAlongWithMales, getAlongWithFemales, getAlongWithKids, getAlongWithHumans, description, gender) "
                 + "VALUES('" + dog.dogName + "', '" + dog.idUser + "', '" + dog.age + "', '" + dog.breed + "', '"
                 + dog.size + "', '" + dog.getAlongWithMales + "', '" + dog.getAlongWithFemales + "', '"
                 + dog.getAlongWithKids + "', '" + dog.getAlongWithHumans +  "', '" + dog.description +  "', '" + dog.gender + "');";

      if (dog.photo != null) {
            var nomImg = "profil_" + dog.dogName + dog.idUser;
            console.log("Val", dog.photo);
            var img = new Buffer(dog.photo, 'base64');
            fs.writeFile('img/profil_' + dog.dogName + dog.idUser + '.jpg', img, function (err) {
                if (err){
                    console.log(err);
                }
                else{
                    console.log('L\'image a été sauvegardée');
                }
            });
      }
      db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             return;
         }
         else{
             self.lastInsertIdForDogs(behaviours, socket);
         }
    });
  };

  this.lastInsertIdForDogs = function(behaviours, socket){
    var req = "SELECT LAST_INSERT_ID();";
    db.query(req, function select(err, result) {
       if (err) {
           console.log(err);
           return;
       }
       else{
           var lastid = result[0]['LAST_INSERT_ID()'];
           var b;
           for(b in behaviours){
               self.addDogBehaviour(lastid, behaviours[b].idBehaviour);
               if (b == behaviours.length - 1){
                   socket.emit("RTryAddDog");
               }
           }
           if (b == null){
               socket.emit("RTryAddDog");
           }
       }
   })
   };

   this.addDogBehaviour = function(idDog, idBehaviour){
       var req = "INSERT INTO DogBehaviour(idDog, idBehaviour) VALUES ('" + idDog + "', '" + idBehaviour + "');";
       db.query(req, function select(err, result){
           if (err){
               console.log(err);
           }
       })
   };


  this.addWalk = function(walk, walkdogs, walklocations, socket){
      var req = "INSERT INTO Walk(city, idUser, walkName, description, departure) "
                 + "VALUES('" + walk.city + "', '" + walk.idUser + "', '" + walk.walkName + "', '"
                 + walk.description + "', '" + walk.departure + "');";
      db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             return;
         }
         else{
             console.log("Value des walklocations dans addWalk", walklocations);
             self.lastInsertId(walkdogs, walklocations, socket);
         }
    });
  };

  this.lastInsertId = function(walkdogs, walklocations, socket){
      console.log("Value des walklocations dans lastInsertId", walklocations);
    var req = "SELECT LAST_INSERT_ID();";
    db.query(req, function select(err, result) {
       if (err) {
           console.log(err);
           return;
       }
       else{
           var lastid = result[0]['LAST_INSERT_ID()'];
           var d;
           for(d in walkdogs){
               self.addDogToWalk(lastid, walkdogs[d].idDog, walklocations);
               if (d == walkdogs.length -1){
                   var l;
                   for(l in walklocations){
                       var newLoc = new Locations(0, walklocations[l].latitude, walklocations[l].longitude, walklocations[l].ordering);
                       self.addLocation(newLoc, lastid);
                       if (l == walklocations.length - 1){
                           socket.emit("RTryAddWalk");
                       }
                   }
               }
           }
       }
  });
  };


  this.addDogToWalk = function(idWalk, idDog, walklocations){
      console.log("Value de l'id walk dans addDogToWalk ", idWalk);
      var req = "INSERT INTO DogWalk(idWalk, idDog) "
                 + "VALUES('" + idWalk + "', '" + idDog + "');";
      db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             return;
         }
         else{
             return true;
         }
    });
  };

  this.addLocation = function(location, idWalk){
      console.log("Value de l'id walk dans addLocation", idWalk);
      var req = "INSERT INTO Location(idWalk, lattitude, longitude, ordering) "
                 + "VALUES('" + idWalk + "', '" + location.lattitude + "', '" + location.longitude + "', '" + location.ordering + "');";
                 console.log(req);
      db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             return;
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
              var i;
              for(i in result){
                  //récup photo
                  console.log("récup photos");
                  fs.readFile('img/profil_' + result[i]['dogName'] + result[i]['idUser'] +  '.jpg', function (err, data) {
                    if (err) {
                        fs.readFile('user.jpg', function (err, data) {
                            var image = new Buffer(data).toString('base64');
                            result[i]['photo'] = image;
                            self.getBehaviours("RGetAllMyDogs", result, i, socket);
                            console.log(1.1);
                        });
                    }
                    else {
                        var image = new Buffer(data).toString('base64');
                        result[i]['photo'] = image;
                        console.log(result);
                        console.log(i);
                        self.getBehaviours("RGetAllMyDogs", result, i, socket);
                        console.log(1.2);
                    }
                });
              }
          }
      });
  };

  this.getBehaviours = function(event, result, i, socket){
      console.log("ici");
      var req = "SELECT * FROM DogBehaviour WHERE idDog = " + result[i]['idDog'] + ";";
      db.query(req, function select(err, resultBeh) {
          if (err) {
              console.log(err);
              socket.emit(event, err['errno']);
          }
          else{
              var j;
              if (resultBeh.length > 0){
                  console.log('valeur de resultBeh' + resultBeh);
                  for (j in resultBeh){
                      console.log(j);
                      var req = "SELECT * FROM Behaviour WHERE Behaviour.idBehaviour = " + resultBeh[j].idBehaviour + ";";
                      db.query(req, function select(err, resultBehaviour) {
                          console.log("Result behaviour donne" + util.inspect(resultBehaviour));
                          if (err) {
                              console.log(err);
                              socket.emit(event, err['errno']);
                          }
                          else{
                              result[i].behaviours = resultBehaviour;
                              if (i == result.length - 1){
                                  //dernier element
                                  socket.emit(event, result);
                                  console.log("RESULTAT FINAL", util.inspect(result));
                              }
                          }
                      });
                  }
              }
              else{
                  socket.emit(event, result);
              }
          }
    });
};

  this.getDogById = function(idDog, socket){
      var req = "SELECT * FROM Dog WHERE idDog = " + idDog + ";";
      db.query(req, function select(err, result) {
          if (err) {
              console.log(err);
              socket.emit("RGetDogById", err['errno']);
          }
          else{
              console.log('img/profil_' + result[0]['dogName'] + result[0]['idUser'] +  '.jpg');
              fs.readFile('img/profil_' + result[0]['dogName'] + result[0]['idUser'] +  '.jpg', function (err, data) {
                if (err) {
                    fs.readFile('user.jpg', function (err, data) {
                        var image = new Buffer(data).toString('base64');
                        result[0]['photo'] = image;
                        self.getBehaviours("RGetDogById", result, 0, socket);
                    });
                }
                else {
                    var image = new Buffer(data).toString('base64');
                    result[0]['photo'] = image;
                    self.getBehaviours("RGetDogById", result, 0, socket);
                }
            });
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
        if (err){
            console.log(err);
        }
        else{
            db.query("DELETE FROM DogWalk WHERE idDog = " + idDog + ";");
            db.query("DELETE FROM DogBehaviour WHERE idDog = " + idDog + ";");
            socket.emit("RdeleteDog");
        }
      });
  };

  this.getAllMyWalks = function(idUser, socket){
      var req = "SELECT * FROM Walk WHERE idUser = " + idUser + ";";
      db.query(req, function select(err, result) {
          if (err) {
              console.log(err);
              socket.emit("RGetAllMyWalks", err['errno']);
          }
          else{
              var i;
              for(i in result){
                  self.getLocation("RGetAllMyWalks", result, i, socket);
              }
          }
      });
  };

  this.getLocation = function(event, result, i, socket){
      var req = "SELECT * FROM Location WHERE idWalk = " + result[i]['idWalk'] + " ORDER BY ordering;";
      db.query(req, function select(err, resultLoc) {
          if (err) {
              console.log(err);
              socket.emit(event, err['errno']);
          }
          else{
              result[i].path = resultLoc;
              self.getDogsForIdWalk(event, result, i, socket);
          }
      });
  };

  this.getAllWalks = function(socket){
      var req = "SELECT * FROM Walk where departure >= NOW();";
      db.query(req, function select(err, result) {
          if (err) {
              console.log(err);
              socket.emit("RGetAllWalks", err['errno']);
          }
          else{
              var resultat = result;
              var i;
              for(i in result){
                  self.getLocation("RGetAllWalks", result, i, socket);
              }
          }
      });
  };

  this.deleteWalk = function(idWalk, socket){
      //Suppression balade
      db.query("DELETE FROM Walk WHERE Walk.idWalk = " + idWalk + ";", function(err, rows, fields) {
          if (err) {
              console.log(err);
          }
          else{
              //Suppression points associés
              db.query("DELETE FROM Location WHERE idWalk = " + idWalk + ";", function(err, rows, fields) {
                  if (err) {
                      console.log(err);
                  }
                  else{
                      //Suppression associations chiens/balades
                      db.query("DELETE FROM DogWalk WHERE idWalk = " + idWalk + ";", function(err, rows, fields) {
                          if (err) {
                              console.log(err);
                          }
                          else{
                              socket.emit("RdeleteWalk");
                          }
                      });
                  }
              });
          }
      });
  };

  this.getUserById = function(idUser, socket){
       db.query("SELECT * FROM User Where idUser = '" + idUser + "';", function select(err, result) {
               if (err) {
                   console.log(err);
                   socket.emit("RGetUser", err['errno']);
               }
               else{
                   fs.readFile('img/profil_' + idUser +  '.jpg', function (err, data) {
                     if (err) {
                         fs.readFile('user.jpg', function (err, data) {
                             var image = new Buffer(data).toString('base64');
                             result[0]['photo'] = image;
                             socket.emit("RGetUser", result[0]);
                         });
                     }
                     else {
                         var image = new Buffer(data).toString('base64');
                         result[0]['photo'] = image;
                         socket.emit("RGetUser", result[0]);
                     }
                 });
               }
      });
  };

  this.getDogsForIdWalk = function(event, result, i, socket){
      var req = "SELECT idDog FROM DogWalk WHERE idWalk = " + result[i]['idWalk'] + ";";
      db.query(req, function select(err, resultDog) {
          if (err) {
              console.log(err);
              socket.emit(event, err['errno']);
          }
          else{
              result[i].dogs = resultDog;
              if (i == result.length - 1){
                  //dernier element
                  socket.emit(event, result);
              }
          }
      });
  };

  this.updateUser = function(User, socket){
      var req = "UPDATE User SET email=\"" + User.email + "\", nickname= \"" + User.nickname + "\", password=\"" + User.password + "\", birthday =\"" + User.birthday + "\", phoneNumber =\"" + User.phoneNumber + "\", description =\"" + User.description + "\", photo=\"" + User.photo + "\" WHERE idUser = " + User.idUser + "; ";
      console.log("req", req);
      db.query(req, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            else{
                socket.emit("RUpdateUser");
            }
        });
  };

  this.updateDog = function(dog, socket){
      console.log(dog);
      var req = "UPDATE Dog SET dogName=\"" + dog.dogName + "\", age= '" + dog.age + "', breed=\"" + dog.breed + "\", size ='" + dog.size
      + "', getAlongWithMales =\"" + dog.getAlongWithMales + "\", getAlongWithFemales =\"" + dog.getAlongWithFemales
      + "\", getAlongWithKids=\"" + dog.getAlongWithKids + "\", getAlongWithHumans=\"" + dog.getAlongWithHumans +
      + "\", description=\"" + dog.description + "\", gender='" + dog.gender  + "' WHERE idDog = " + dog.idDog + "; ";
      db.query(req, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            else{
                var temp = dog.photo;
                if (temp != "") {
                    var img = new Buffer(temp, 'base64');
                    fs.writeFile('img/profil_' + dog.dogName + dog.idUser + '.jpg', img, function (err) {
                        if (err) throw err;
                    });
                }
                socket.emit("RUpdateDog");
            }
    });
  };
}
