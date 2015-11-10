var mysql = require('mysql');

module.exports.connection = new DBConnection();

function DBConnection(){
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'WifWaf'
  });

  connection.connect();

  connection.query('SELECT * FROM Behaviour', function(err, rows, fields) {
    if (err) throw err;

    console.log('Résultat: ', rows[0].description);
  });

  connection.query('INSERT INTO Behaviour(description) VALUES (\'calm\')', function(err, rows, fields) {
    if (err) throw err;
  });

  this.addUser = function(user){
    var req = "INSERT INTO USER(email, nickname, password, birthday, phoneNumber, description, photo) "
                 + "VALUES('" + user.email + "', '" + user.nickname + "', '" + user.password + "', '" + user.birthday + "', '" + user.phoneNumber + "', '" + user.description + "', '" + user.photo + "');";
     db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             return;
         }
     });
  }

  this.addDog = function(dog){
    var req = "INSERT INTO Dog(dogName, age, breed, size, getAlongWithMales, getAlongWithFemales, getAlongWithKids, getAlongWithHumans, description) "
                 + "VALUES('" + dog.dogName + "', '" + dog.age + "', '" + dog.breed + "', '" + dog.size + "', '" + dog.getAlongWithMales + "', '" + dog.getAlongWithFemales + "', '" + dog.getAlongWithKids + "', '" + dog.getAlongWithHumans +  "', '" + dog.description + "');";
     db.query(req, function select(err, result) {
         if (err) {
             console.log(err);
             return;
         }
    });


  connection.end();
}
