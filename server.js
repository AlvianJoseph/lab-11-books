'use strict';
require('dotenv').config();

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//Connect to database
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
// Renders the search form
app.get('/', renderHomepage);
app.get('/new', newSearch);


// Creates a new search to the Google Books API
app.post('/searches', createSearch);


function Book(info) {
    const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
    this.image = info.imageLinks.thumbnail || placeholderImage;
    this.title = info.title || 'No title available';
    this.description = info.description;
    this.authors = info.authors;
    this.link = info.infoLink;
    this.isbn = info.industryIdentifiers[0];
}

function renderHomepage(request, response) {
    let SQL = `SELECT * FROM books;`;
    client.query(SQL)
    .then( databaseResult => (response.render('pages/index', {books: databaseResult.rows})));
    
}

function newSearch(request, response) {
    response.render('pages/searches/new');
}

// Console.log request.body and request.body.search
function createSearch(request, response) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    let query = request.body.search[0];
    console.log(query);

    if (request.body.search[1] === 'title') {url += `+intitle:${request.body.search[0]}`;}
    if (request.body.search[1] === 'author') {url += `+inauthor:${request.body.search[0]}`;}
    if (request.body.search[1] === 'genre') {url += `+subject:${request.body.search[0]}`;}


    superagent.get(url)
        // .then(apiResponse => response.send(apiResponse.body.items));
        .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
        .then(books => response.render('pages/searches/show', { searchResults: books, searchQuery: query }));
}


app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// Catch-all
app.get('*', (request, response) => response.render('pages/error'));