const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
const session = require('express-session');
const authRoutes = require('./auth');

const app = express();

const PORT = 3000;

app.use(session({
    secret: 'chave-secreta', 
    resave: false, 
    saveUninitialized: false, 
    cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));

app.use((req, res, next) => {
    res.locals.isLoggedin = req.session.isLoggedin || false;
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use('/', authRoutes)

app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});



