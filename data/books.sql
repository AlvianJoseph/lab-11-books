DROP TABLE books;

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    authors VARCHAR(255),
    title VARCHAR(255),
    isbn VARCHAR(255),
    genre VARCHAR(255),
    image VARCHAR(255),
    description VARCHAR(1000),
    bookshelf VARCHAR(25)
);

INSERT INTO books (title, authors, isbn, image, description, bookshelf) 
VALUES (
  'Dune',
  'Frank Herbert',
  'ISBN_13 9780441013593',
  'http://books.google.com/books/content?id=B1hSG45JCX4C&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
  'Follows the adventures of Paul Atreides, the son of a betrayed duke given up for dead on a treacherous desert planet and adopted by its fierce, nomadic people, who help him unravel his most unexpected destiny.',
  'Fantasy'
);