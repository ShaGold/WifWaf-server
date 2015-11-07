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

  connection.end();
}
