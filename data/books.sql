DROP TABLE books;

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255),
    title VARCHAR(255),
    isbn NUMERIC(10, 7),
    img_url VARCHAR(255),
    description VARCHAR(1000),
    bookshelf VARCHAR(25)
);