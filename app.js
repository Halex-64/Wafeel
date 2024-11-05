const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./public/assets/js/routes');
const session = require('express-session');
const authRoutes = require('./public/assets/js/auth');

const app = express();

const PORT = 3000;

const API_KEY = process.env.API_KEY;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use(session({
    secret: 'chave-secreta', 
    resave: false, 
    saveUninitialized: false, 
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, sameSite: 'strict' } 
}));

app.use((req, res, next) => {
    res.locals.isLoggedin = req.session.isLoggedin || false;
    next();
});

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.get('/api/providers', async (req, res) => {
    const response = await fetch(`https://api.themoviedb.org/3/watch/providers/movie?api_key=${API_KEY}&watch_region=BR`);
    const data = await response.json();
    res.json(data.results);
});


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);

app.use('/', routes);




