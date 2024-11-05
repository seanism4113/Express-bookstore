CREATE TABLE books (
  isbn TEXT PRIMARY KEY,
  amazon_url TEXT,
  author TEXT NOT NULL,
  language TEXT, 
  pages INTEGER,
  publisher TEXT,
  title TEXT NOT NULL, 
  year INTEGER
);
