var mysql = require('mysql');

var User = require('./controllers/User.js').user;

var util = require('util');

var Locations = require('./controllers/Location.js').locations;

var fs = require('fs');

var gcm = require('node-gcm');

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
            var img = new Buffer(dog.photo, 'base64');
            fs.writeFile('img/profil_' + dog.dogName + dog.idUser + '.jpg', img, function (err) {
                if (err){
                    console.log(err);
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
               console.log("behavior added");
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
             self.lastInsertId(walkdogs, walklocations, socket);
         }
    });
  };

  this.lastInsertId = function(walkdogs, walklocations, socket){
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
                           //gestion envoi à tous
                           self.sendGcm();
                       }
                   }
               }
           }
       }
  });
  };

  this.getAllTokens = function(){
      var req = "SELECT * FROM Token;";
      var tb = [];
      db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
         }
         else{
             for(i in result){
                 tb.push(result[i]['token']);
             }
             self.sendGcm(tb);
         }
    });
  };

  this.getAllParticipationsForIdWalk = function(idWalk, socket){
      var req = "SELECT * FROM Participation Where idWalk = '" + idWalk + "';";
      db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
         }
         else{
             console.log(util.inspect(result));
             var Json = [];
             for(p in result){
                 //On récupère les infos intéressantes
                 var currentObj = {};
                 currentObj.idWalk = result[p]['idWalk'];
                 currentObj.idParticipation = result[p]['idParticipation'];
                 currentObj.valid = result[p]['valid'];
                 console.log("participation :" + result[p]['idUser']);
                 //pour savoir si dernière participation
                 console.log("p value", p);
                 console.log("result length", result.length);
                 console.log("result length - 1", result.length - 1);
                 if(p == result.length - 1){
                     last = true;
                 }else{ last = false; }
                 console.log("value last", last);

                 //On récupère le user
                 self.getUserByIdForParticipations(result[p]['idUser'], Json, currentObj, result[p]['idDog'], socket, last);
             }

         }
    });
  };

  this.getUserByIdForParticipations = function(idUser, Json, currentObj, idDog, socket, last){
      db.query("SELECT * FROM User Where idUser = '" + idUser + "';", function select(err, result) {
              if (err) {
                  console.log(err);
              }
              else{
                  fs.readFile('img/profil_' + idUser +  '.jpg', function (err, data) {
                    if (err) {
                        fs.readFile('user.jpg', function (err, data) {
                            var image = new Buffer(data).toString('base64');
                            result[0]['photo'] = image;
                            currentObj.user = result[0];
                            //Il reste à récupérer le chien
                            self.getDogByIdForParticipations(currentObj, Json, idDog, socket, last);
                        });
                    }
                    else {
                        var image = new Buffer(data).toString('base64');
                        result[0]['photo'] = image;
                        currentObj.user = result[0];
                        //Il reste à récupérer le chien
                        self.getDogByIdForParticipations(currentObj, Json, idDog, socket, last);
                    }
                });
              }
     });
  };

  this.getDogByIdForParticipations = function(currentObj, Json, idDog, socket, last){
      var req = "SELECT * FROM Dog WHERE idDog = " + idDog + ";";
      db.query(req, function select(err, result) {
          if (err) {
              console.log(err);
          }
          else{
              fs.readFile('img/profil_' + result[0]['dogName'] + result[0]['idUser'] +  '.jpg', function (err, data) {
                if (err) {
                    fs.readFile('img/dog.jpg', function (err, data) {
                        var image = new Buffer(data).toString('base64');
                        result[0]['photo'] = image;
                        currentObj.dog = result[0];
                        Json.push(currentObj);
                        if(last == true){ socket.emit("RgetAllParticipationsForIdWalk", Json); }
                    });
                }
                else {
                    var image = new Buffer(data).toString('base64');
                    result[0]['photo'] = image;
                    currentObj.dog = result[0];
                    Json.push(currentObj);
                    if(last == true){ socket.emit("RgetAllParticipationsForIdWalk", Json); }
                }
            });
          }
      });
  };

  this.getAllParticipationsForIdUser = function(idUser, socket){
      var req = "SELECT * FROM Participation Where idUser = '" + idUser + "';";
      db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
         }
         else{
             //socket.emit("RgetAllParticipationsForIdUser", result);
             console.log(idUser);
             console.log("Résultat: " + result);
             //faire util.inspect
         }
    });
  };

  this.sendGcm = function(tbtokens){
      var message = new gcm.Message();
  	message.addData('TypeNotif', 'addWalk');

  	var sender = new gcm.Sender("AIzaSyANgYc99-Oa-IBRRIwCo7nzdBwBannrc4o");

  	console.log("Envoi du message au GCM");
  	sender.send(message, { registrationTokens: tbtokens }, function (err, response) {
  		if(err) console.error(err);
  		else    console.log(response);
  	});
    };

    //A tester: à appeler lorsqu'on addParticipation ou acceptParticipation
    this.sendGcmToUserId = function(idUser, idWalk){
        //Récupération token
        db.query("SELECT * FROM Token Where idUser = '" + idUser + "';", function select(err, result) {
                if (err) {
                    console.log(err);
                }
           else{
               // Envoi à ce token
               var message = new gcm.Message();
               	message.addData('TypeNotif', 'addParticipation');
                message.addData('walk', idWalk);

               	var sender = new gcm.Sender("AIzaSyANgYc99-Oa-IBRRIwCo7nzdBwBannrc4o");

               	console.log("Envoi du message au GCM");
               	sender.send(message, { registrationTokens: result[0]['token'] }, function (err, response) {
               		if(err) console.error(err);
               		else    console.log(response);
               	});
               }
      });
     };

  this.addParticipation = function(participation, socket){
      var req = "INSERT INTO Participation(idWalk, idDog, idUser, valid) "
                 + "VALUES('" + participation.idWalk + "', '" + participation.idDog + "', '" + participation.idUser +"', '" + 0 +  "');";
     db.query(req, function select(err, result) {
        if (err) {
            console.log(err);
            return;
        }
        else{
            socket.emit("RTryAddParticipation");
            //Envoi token
            //TODO passer en param l'id du chien? son nom? et le nom de la personne? comme ça on peut rediriger vers le profil du chien? ou de la personne?
            self.sendGcmToUserId(participation.idUser, participation.idWalk);
        }
    });
  };

  this.addDogToWalk = function(idWalk, idDog, walklocations){
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
                  self.recupPhoto("RGetAllMyDogs", result, i, socket);
              }
          }
      });
  };

this.recupPhoto = function(event, result, i, socket){
    fs.readFile('img/profil_' + result[i]['dogName'] + result[i]['idUser'] +  '.jpg', function (err, data) {
      if (err) {
          fs.readFile('img/dog.jpg', function (err, data) {
              var image = new Buffer(data).toString('base64');
              result[i]['photo'] = image;
              self.getBehaviours("RGetAllMyDogs", result, i, socket);
          });
      }
      else {
          var image = new Buffer(data).toString('base64');
          result[i]['photo'] = image;
          self.getBehaviours("RGetAllMyDogs", result, i, socket);
      }
  });
}


  this.getBehaviours = function(event, result, i, socket){
      console.log("Appelé");
      var req = "SELECT * FROM DogBehaviour WHERE idDog = " + result[i]['idDog'] + ";";
      db.query(req, function select(err, resultBeh) {
          if (err) {
              console.log(err);
              socket.emit(event, err['errno']);
          }
          else{
              console.log("resultBeh", resultBeh);
              var j;
              if (resultBeh.length > 0){
                  console.log("jusque ici");
                  result[i]['behaviours'] = [];
                  for (j in resultBeh){
                      console.log("lid behaviour", resultBeh[j].idBehaviour);
                      var req = "SELECT * FROM Behaviour WHERE Behaviour.idBehaviour = " + resultBeh[j].idBehaviour + ";";
                      db.query(req, function select(err, resultBehaviour) {
                          if (err) {
                              console.log(err);
                              socket.emit(event, err['errno']);
                          }
                          else{
                              result[i]['behaviours'].push(resultBehaviour[0]);
                              console.log(resultBehaviour[0]);
                              console.log(result[i]['behaviours']);
                              if (result[i]['behaviours'].length == resultBeh.length){
                                  //dernier element
                                  socket.emit(event, result);
                                  console.log("final", result[0].behaviours);
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
              fs.readFile('img/profil_' + result[0]['dogName'] + result[0]['idUser'] +  '.jpg', function (err, data) {
                if (err) {
                    fs.readFile('img/dog.jpg', function (err, data) {
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
      var req = "UPDATE User SET email=\"" + User.email + "\", nickname= \"" + User.nickname + "\", password=\"" + User.password + "\", birthday =\"" + User.birthday + "\", phoneNumber =\"" + User.phoneNumber + "\", description =\"" + User.description + "\" WHERE idUser = " + User.idUser + "; ";
      db.query(req, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            else{
                var temp = User.photo;
                if (temp != "") {
                    var img = new Buffer(temp, 'base64');
                    fs.writeFile('img/profil_' + User.idUser + '.jpg', img, function (err) {
                        if (err) throw err;
                    });
                }
                socket.emit("RUpdateUser");
            }
        });
  };

  this.updateDog = function(dog, socket, dogBehaviours){
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
                //On supprime les liens qui existaient
                db.query("DELETE FROM DogBehaviour WHERE idDog = " + dog.idDog + ";", function(err, rows, fields) {
                    if (err) {
                        console.log(err);
                    }
                });
                for(d in dogBehaviours){
                        //On crée les liens
                        var req = "INSERT INTO DogBehaviour(idDog, idBehaviour) VALUES ('" + dog.idDog + "', '" + dogBehaviours[d].idBehaviour + "');";
                        console.log(req);
                        db.query(req, function select(err, result) {
                           if (err) {
                               console.log(err);
                               return;
                           }
                           else{
                               console.log("on emit");
                               socket.emit("RUpdateWalk");
                           }
                    });
                }
                socket.emit("RUpdateDog");
            }
    });
  };

  this.updateWalk = function(walk, socket, walkDogs){
      var req = "UPDATE Walk SET city=\"" + walk.city + "\", walkName= '" + walk.walkName + "', description=\"" + walk.description
      + "\", departure ='" + walk.departure
      + "' WHERE idWalk = " + walk.idWalk + "; ";
      db.query(req, function select(error, results, fields) {
            if (error) {
                console.log(error);
                return;
            }
            else{
                //On supprime les liens qui existaient
                db.query("DELETE FROM DogWalk WHERE idWalk = " + walk.idWalk + ";", function(err, rows, fields) {
                    if (err) {
                        console.log(err);
                    }
                });
                for(d in walkDogs){
                        //On crée les liens
                        var req = "INSERT INTO DogWalk(idWalk, idDog) "
                                   + "VALUES('" + walk.idWalk + "', '" + walkDogs[d].idDog + "');";
                        db.query(req, function select(err, result) {
                           if (err) {
                               console.log(err);
                               return;
                           }
                           else{
                               console.log("on emit");
                               socket.emit("RUpdateWalk");
                           }
                    });
                }
            }
    });
  };

  this.addToken = function(token){
      console.log("val token", token);
      var req = "INSERT INTO Token(token, idUser) "
                   + "VALUES('" + token.token  + "', '" + token.idUser + "');";
       db.query(req, function select(err, result) {
           if (err) {
               console.log(err);
           }
       });
  };
}
