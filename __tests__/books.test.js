process.env.NODE_ENV = "test";

const db = require("../db");
const request = require("supertest");
const express = require("express");
const bookRoutes = require("../routes/books");
const app = express();

app.use(express.json());
app.use("/books", bookRoutes);

describe("Test Book Routes", () => {
	beforeEach(async () => {
		await db.query("DELETE FROM books");
		await db.query(`
			INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
			VALUES (
				'0691161518', 
				'http://a.co/eobPtX2', 
				'Matthew Lane', 
				'english', 
				264, 
				'Princeton University Press', 
				'Power-Up: Unlocking the Hidden Mathematics in Video Games',
				2017
			)
		`);
	});

	test("GET /books - Return all books", async () => {
		const response = await request(app).get("/books");
		expect(response.status).toBe(200);
		expect(response.body.books.length).toBe(1);
		expect(response.body.books[0]).toHaveProperty("isbn", "0691161518");
	});

	test("GET /books/:isbn - Return a single book", async () => {
		const response = await request(app).get("/books/0691161518");
		expect(response.status).toBe(200);
		expect(response.body.book).toHaveProperty("author", "Matthew Lane");
	});

	test("POST /books Create a new book", async () => {
		const newBook = {
			isbn: "1234567890",
			amazon_url: "http://a.co/eobPtX2",
			author: "George Martin",
			language: "english",
			pages: 366,
			publisher: "Stark Publishing",
			title: "Game of Thrones",
			year: 2020,
		};

		const response = await request(app).post("/books").send(newBook);
		expect(response.status).toBe(201);
		expect(response.body.book).toHaveProperty("title", "Game of Thrones");
	});

	test("POST /books - Create new book with multiple validation errors", async () => {
		const newBook = {
			isbn: "1234567",  
			amazon_url: "//a.co/eobPtX2",  
			author: "George Martin",
			language: "english",
			pages: "366",  
			publisher: "Stark Publishing",
			title: "Game of Thrones",
			year: 2030
		};
	
		const response = await request(app).post("/books").send(newBook);
	
		expect(response.status).toBe(400);
		expect(response.error.text).toContain("does not meet minimum length of 10")
		expect(response.error.text).toContain("does not conform to the &quot;uri&quot; format")
		expect(response.error.text).toContain("pages is not of a type(s) integer")
		expect(response.error.text).toContain("year must be less than or equal to 2024")
	});

	test("PUT /books/:isbn - should update a book", async () => {
		const updatedBook = {
			isbn: "0691161518",  
			amazon_url: "http://a.co/eobPtX2",  
			author: "Matthew Lane",
			language: "english",
			pages: 264,  
			publisher: "Princeton University Press",
			title: "Updated Title",
			year: 2017
		};

		const response = await request(app).put("/books/0691161518").send(updatedBook); 
		expect(response.status).toBe(200);
		expect(response.body.book).toHaveProperty("title", "Updated Title"); 
	});

	test("DELETE /books/:isbn - should delete a book", async () => {
		const response = await request(app).delete("/books/0691161518"); 
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("message", "Book deleted"); 
	});

	afterAll(async () => {
		await db.end();
	});
});
