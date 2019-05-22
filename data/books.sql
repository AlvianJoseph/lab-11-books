DROP TABLE books;

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    authors VARCHAR(255),
    title VARCHAR(255),
    isbn NUMERIC(10, 7),
    genre VARCHAR(255),
    image VARCHAR(255),
    description VARCHAR(1000),
    bookshelf VARCHAR(25)
);