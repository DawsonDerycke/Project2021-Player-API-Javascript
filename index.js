const express = require('express');
const app = express();
const cors = require('cors');
const body_parser = require('body-parser');
const queryPromise = require('./queryPromise');
const user = require('./controllers/user.js');
const classe = require('./controllers/classe.js');

app.use(body_parser.urlencoded({ extended: false }));
app.use(cors());

const port = 3001;

// CONTROLLERS
user(app, queryPromise);
classe(app, queryPromise);

app.listen(port, () => {
    console.log('Server started : ' + port);
});