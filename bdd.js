const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '51.91.208.24',
    user: 'dawson',
    password: 'dawson5689', 
    database: 'joueur_projet'
});

connection.connect();

module.exports = connection;