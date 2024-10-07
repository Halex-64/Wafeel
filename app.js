const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes');
const authRoutes = require('./auth');

const app = express();

const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use('/', authRoutes)

app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});



