var mysql = require('mysql');

module.exports.dbManager = new DB();

function DB(){
  var db = mysql.createConnection({
    host: "localhost",
    user: "utilisateur",
    password: "mot de passe",
    database: "WifWaf"
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
}
