const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
}
  
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}
  

//only registered users can login
const jwtSecretKey = 'your_secret_key_here';  // Use a strong secret key

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = { username }; // Create a user object for the payload
  const token = jwt.sign(user, jwtSecretKey, { expiresIn: '1h' });

  return res.status(200).json({
    message: "Login successful",
    token: token
  });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    let filtered_book = books[isbn]
    if (filtered_book) {
        let review = req.query.review;
        let reviewer = req.session.authorization['username'];
        if(review) {
            filtered_book['reviews'][reviewer] = review;
            books[isbn] = filtered_book;
        }
        res.send(`The review for the book with ISBN  ${isbn} has been added/updated.`);
    }
    else{
        res.send("Unable to find this ISBN!");
    }
  });


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const filtered_book = books[isbn];

    if (!filtered_book) {
        res.status(404).send("Book with this ISBN not found!");
        return;
    }

    // Assuming that the username is stored in the JWT token and extracted when verifying the token.
    // You would typically use middleware to verify the token and attach the user info to the request object.
    // Here we simulate this by assuming that the username is available in req.user.username if the token is valid.
    const username = req.user.username; // This needs proper setup to work; see notes below on JWT token handling.

    if (filtered_book.reviews && filtered_book.reviews.hasOwnProperty(username)) {
        delete filtered_book.reviews[username];  // Remove the review made by the user
        res.status(200).send(`Your review for the book with ISBN ${isbn} has been deleted.`);
    } else {
        res.status(404).send("No review by you found for this book to delete.");
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
