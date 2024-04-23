const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function(req, res) {
    try {
      const response = await axios.get('https://mohammadnafa-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
      res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      res.status(500).send('Error fetching books: ' + error.message);
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function(req, res) {
    const isbn = req.params.isbn;
    axios.get(`https://mohammadnafa-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/${isbn}`)
      .then(response => {
        res.send(JSON.stringify(response.data, null, 4));
      })
      .catch(error => {
        res.status(500).send('Error fetching book details: ' + error.message);
      });
  });
  
// Get book details based on author
public_users.get('/author/:author', function(req, res) {
    const author = req.params.author;
    axios.get(`https://mohammadnafa-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author=${encodeURIComponent(author)}`)
      .then(response => {
        res.send(response.data);
      })
      .catch(error => {
        res.status(500).send('Error fetching books by author: ' + error.message);
      });
  });

// Get all books based on title
// Get book details based on title
public_users.get('/title/:title', function(req, res) {
    const title = req.params.title;
    axios.get(`https://mohammadnafa-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/title=${encodeURIComponent(title)}`)
      .then(response => {
        res.send(response.data); // Assuming the API returns an array of books
      })
      .catch(error => {
        res.status(500).send('Error fetching books by title: ' + error.message);
      });
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews)
});

module.exports.general = public_users;
