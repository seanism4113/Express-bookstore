/** Express app for bookstore. */

const express = require("express");
const app = express();
const ExpressError = require("./expressError");
const bookRoutes = require("./routes/books");

app.use(express.json());

app.use("/books", bookRoutes);

/** 404 handler */

app.use(function (req, res, next) {
	return next(new ExpressError("Not Found", 404));
});

/** general error handler */
app.use(function (err, req, res, next) {
	res.status(err.status || 500);

	return res.json({
		error: {
			message: err.message,
			status: err.status || 500,
		},
	});
});

module.exports = app;
