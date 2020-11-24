const express = require('express');
const app = express();

const body_parser = require('body-parser');
app.use(body_parser.urlencoded({ extended: false }));

const port = 3001;

app.listen(port, () => {
    console.log('Server started : ' + port);
});