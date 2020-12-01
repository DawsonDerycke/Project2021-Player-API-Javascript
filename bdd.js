const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'joueur_projet'
});

connection.connect();

module.exports = connection;