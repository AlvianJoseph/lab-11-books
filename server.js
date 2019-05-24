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
app.post('/books', saveBook);
app.get('/books/:id', getSpecificBook);
app.put('/books/:id', updateBook);
app.delete('/books/:id', deleteBook);
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

function handleError(error, response) {
    response.render('pages/error', { error: 'Uh Oh' });
  }

function Book(info) {
    const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
    this.image = info.imageLinks.thumbnail || placeholderImage;
    this.title = info.title || 'No title available';
    this.description = info.description;
    this.authors = info.authors;
    this.link = info.infoLink;
    this.isbn = Object.values(info.industryIdentifiers[0]);
}

// Request Handlers
function loadHomePage(request, response) {
    let SQL = `SELECT * FROM books;`;
    client.query(SQL)
        .then(databaseResult => (response.render('pages/index', { books: databaseResult.rows, formAction: 'update' })))
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
        .then(books => response.render('pages/searches/show', { searchResults: books, searchQuery: query, formAction: 'create'
     }));
}

function newSearch(request, response) {
    response.render('pages/searches/new');
}


function getSpecificBook(request, response) {
    const SQLbyId = 'SELECT * FROM books WHERE id=$1;';
        client.query(SQLbyId, [request.params.id]).then(result => {
            response.send(result.rows[0])
            // response.render('pages/books/detail.ejs', { showBook: result.rows[0] });
        })
        .catch(err=> console.error(err));
}

function updateBook(request, response) {
    let { title, authors, description, isbn, bookshelf, image } = request.body;

    let SQL = `UPDATE books SET title=$1, authors=$2, description=$3, isbn=$4, bookshelf=$5, image=$6 WHERE id=$7;`;

    let values = [title, authors, description, isbn, bookshelf, image, request.params.id];
    console.log(values);
    client.query(SQL, values)
    .then(() => response.status(204).send())
        .catch(err=> console.error(err));

  }

  function saveBook(request, response) {
      console.log('Book Saved');
    let { title, authors, description, isbn, bookshelf, image } = request.body;  

    let SQL = `INSERT INTO books (title, authors, description, isbn, bookshelf, image) 
    VALUES ( $1,$2,$3,$4,$5,$6)`;

    let values = [title, authors, description, isbn, bookshelf, image];
    client.query(SQL, values)
    .then(() => response.status(204).send())
        .catch(err=> console.error(err));

  }

function deleteBook(request, response) {
    console.log('Book deleted');
    client.query('DELETE FROM books WHERE id=$1', [request.params.id])
    .then(result => response.redirect('/'));
}
