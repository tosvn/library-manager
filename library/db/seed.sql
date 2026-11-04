INSERT INTO authors (name) VALUES
    ('Chinua Achebe'),
    ('Jane Austen'),
    ('George Orwell'),
    ('Toni Morrison'),
    ('Gabriel Garcia Marquez');

INSERT INTO books (title, year, author_id)
SELECT 'Things Fall Apart', 1958, authors.id
FROM authors
WHERE authors.name = 'Chinua Achebe';

INSERT INTO books (title, year, author_id)
SELECT 'No Longer at Ease', 1960, authors.id
FROM authors
WHERE authors.name = 'Chinua Achebe';

INSERT INTO books (title, year, author_id)
SELECT 'Pride and Prejudice', 1813, authors.id
FROM authors
WHERE authors.name = 'Jane Austen';

INSERT INTO books (title, year, author_id)
SELECT 'Emma', 1815, authors.id
FROM authors
WHERE authors.name = 'Jane Austen';

INSERT INTO books (title, year, author_id)
SELECT 'Nineteen Eighty-Four', 1949, authors.id
FROM authors
WHERE authors.name = 'George Orwell';

INSERT INTO books (title, year, author_id)
SELECT 'Animal Farm', 1945, authors.id
FROM authors
WHERE authors.name = 'George Orwell';

INSERT INTO books (title, year, author_id)
SELECT 'Beloved', 1987, authors.id
FROM authors
WHERE authors.name = 'Toni Morrison';

INSERT INTO books (title, year, author_id)
SELECT 'The Bluest Eye', 1970, authors.id
FROM authors
WHERE authors.name = 'Toni Morrison';

INSERT INTO books (title, year, author_id)
SELECT 'One Hundred Years of Solitude', 1967, authors.id
FROM authors
WHERE authors.name = 'Gabriel Garcia Marquez';

INSERT INTO books (title, year, author_id)
SELECT 'Love in the Time of Cholera', 1985, authors.id
FROM authors
WHERE authors.name = 'Gabriel Garcia Marquez';

INSERT INTO members (name, phone) VALUES
    ('Bola Ade', NULL),
    ('Ada Okafor', NULL),
    ('Samuel Mensah', NULL),
    ('Grace Nwosu', NULL),
    ('David Kamau', NULL);

INSERT INTO loans (book_id, member_id, borrowed_on, due_on, returned_on)
SELECT books.id, members.id, CURRENT_DATE - 3, CURRENT_DATE + 11, NULL
FROM books
JOIN members ON members.name = 'Bola Ade'
WHERE books.title = 'Things Fall Apart';

INSERT INTO loans (book_id, member_id, borrowed_on, due_on, returned_on)
SELECT books.id, members.id, CURRENT_DATE - 5, CURRENT_DATE + 9, NULL
FROM books
JOIN members ON members.name = 'Ada Okafor'
WHERE books.title = 'Pride and Prejudice';

INSERT INTO loans (book_id, member_id, borrowed_on, due_on, returned_on)
SELECT books.id, members.id, CURRENT_DATE - 20, CURRENT_DATE - 6, CURRENT_DATE - 4
FROM books
JOIN members ON members.name = 'Samuel Mensah'
WHERE books.title = 'Animal Farm';
