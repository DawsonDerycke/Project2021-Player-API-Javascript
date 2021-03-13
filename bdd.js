const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '135.125.95.178',
    user: 'dawson',
    password: '22j28m=PmT+4e+?<', 
    database: 'joueur_projet'
});

connection.connect();

module.exports = connection;