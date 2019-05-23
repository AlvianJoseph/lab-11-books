'use strict'

// Environment variables
require('dotenv').config();

// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));


app.use(methodOverride((request, response) => {
    if (request.body && typeof request.body === 'object' && '_method' in request.body) {
        let method = request.body._method;
        delete request.body._method;
        return method;
    }
}))

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// listen for requests
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// API Routes
app.get('/', loadHomePage);
app.post('/searches', doSearch);
app.get('/new', newSearch);
app.post('/books', createBook);
app.get('/books/:id', getSpecificBook);
app.put('/books/:id', updateBook);
app.delete('/books/:id', deleteBook);
app.get('/form', showForm);
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

function Book(info) {
    const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
    this.image = info.imageLinks.thumbnail || placeholderImage;
    this.title = info.title || 'No title available';
    this.description = info.description;
    this.authors = info.authors;
    this.link = info.infoLink;
    this.isbn = info.industryIdentifiers[0].indentifier;
}

// Request Handlers
function loadHomePage(request, response) {
    let SQL = `SELECT * FROM books;`;
    client.query(SQL)
        .then(databaseResult => (response.render('pages/index', { books: databaseResult.rows })))
}

function doSearch(request, response) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    let query = request.body.search[0];
    console.log(query);

    if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
    if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
    if (request.body.search[1] === 'genre') { url += `+subject:${request.body.search[0]}`; }

    superagent.get(url)
        // .then(apiResponse => response.send(apiResponse.body.items));
        .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
        .then(books => response.render('pages/searches/show', { searchResults: books, searchQuery: query }));
}

function newSearch(request, response) {
    response.render('pages/searches/new');
}

function createBook(request, response) {
    console.log(request.body);
    const body = request.body;
  
    client.query('INSERT INTO books (title, author, description, image) VALUES ($1, $2, $3, $4)', [body.title, body.author, body.description, body.image]);
  
    //redirect them to home
    response.redirect('/');
}

function getSpecificBook(request, response) {
    const SQLbyId = 'SELECT * FROM books WHERE id=$1;';
        client.query(SQLbyId, [request.params.book_id]).then(result => {
            response.render('pages/books/detail.ejs', { showBook: result.rows[0] });
        })
}

function updateBook(request, response) {
    response.send('updateBook');
}

function deleteBook(request, response) {
    client.query('DELETE FROM books WHERE id=$1', [request.params.book_id])
    response.redirect('/');
}


function showForm(request, response) {
    response.render('pages/books/form', {formAction: 'update', 
book: {title: 'Blah', authors: 'Me', description: 'The best book ever', isbn: '12342321' }});

}