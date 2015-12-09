var mysql = require('mysql');

var User = require('./controllers/User.js').user;

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
             //var currentUser = new User(rows[0].idUser, rows[0].email, rows[0].nickname, rows[0].password, rows[0].birthday, rows[0].phoneNumber, rows[0].description, rows[0].photo);
             console.log(err);
             console.log(rows);
             console.log(fields);
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
             socket.emit(event, jsonUser);
         });
    };

  this.addDog = function(dog){
      var req = "INSERT INTO Dog(dogName, idUser, age, breed, size, getAlongWithMales, getAlongWithFemales, getAlongWithKids, getAlongWithHumans, description) "
                 + "VALUES('" + dog.dogName + "', '" + dog.idUser + "', '" + dog.age + "', '" + dog.breed + "', '"
                 + dog.size + "', '" + dog.getAlongWithMales + "', '" + dog.getAlongWithFemales + "', '"
                 + dog.getAlongWithKids + "', '" + dog.getAlongWithHumans +  "', '" + dog.description + "');";
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
}
