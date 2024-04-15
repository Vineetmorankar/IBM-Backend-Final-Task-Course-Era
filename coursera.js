const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;
app.use(express.json());

// Sample data (replace this with actual data retrieval logic)
const books = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    reviews: [],
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    reviews: [
      "A dystopian masterpiece that delves into the dangers of totalitarianism.",
      "Thought-provoking and relevant even today.",
      "Orwell's vision of a controlled society is chillingly realistic.",
    ],
  },
  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    reviews: [
      "An iconic novel about the American Dream, love, and disillusionment.",
      "Fitzgerald's prose is elegant and evocative.",
      "The characters and settings are richly developed.",
    ],
  },
  {
    id: 4,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    reviews: [
      "A timeless romance novel with witty social commentary.",
      "Austen's characters are vibrant and relatable.",
      "The novel's exploration of social norms is still relevant today.",
    ],
  },
  {
    id: 5,
    title: "The Catcher in the Rye",
    author: "Harper Lee",
    isbn: "9780316769174",
    reviews: [
      "A coming-of-age novel that captures the angst and confusion of adolescence.",
      "Holden Caulfield's voice is unique and memorable.",
      "The novel's themes of alienation and rebellion resonate with readers.",
    ],
  },
];

const users = [
  { id: 1, username: "Vineet", password: "123" },
  { id: 2, username: "pratik", password: "321" },
];

// Task 1: Get the book list available in the shop
app.get("/api/books", (req, res) => {
  res.json(books);
});

// Task 2: Get the books based on ISBN
app.get("/api/books/:isbn", (req, res) => {
  const { isbn } = req.params;
  const book = books.find((b) => b.isbn === isbn);
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

// Task 3: Get all books by Author
app.get("/api/books/author/:author", (req, res) => {
  const { author } = req.params;
  const booksByAuthor = books.filter((b) => b.author === author);
  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor);
  } else {
    res.status(404).json({ error: "No books found for this author" });
  }
});

// Task 4: Get all books based on Title
app.get("/api/books/title/:title", (req, res) => {
  const { title } = req.params;
  const booksByTitle = books.filter((b) =>
    b.title.toLowerCase().includes(title.toLowerCase())
  );
  if (booksByTitle.length > 0) {
    res.json(booksByTitle);
  } else {
    res.status(404).json({ error: "No books found with this title" });
  }
});

// Task 5: Get book Review
app.get("/api/books/review/:bookId", (req, res) => {
  const { bookId } = req.params;
  const book = books.find((b) => b.id.toString() === bookId);
  if (book) {
    res.json({ reviews: book.reviews });
  } else {
    res.status(404).json({ error: "Book review not found" });
  }
});

// Task 6: Register New user
app.post("/api/users/register", (req, res) => {
  const { username, email, password } = req.body;

  // Check if the username or email is already registered
  const existingUser = users.find(
    (user) => user.username === username || user.email === email
  );
  if (existingUser) {
    return res.status(400).json({ error: "Username or email already exists" });
  }

  // Add the new user to the users array
  const newUser = { id: users.length + 1, username, email, password };
  users.push(newUser);

  res
    .status(201)
    .json({ message: "User registered successfully", user: newUser });
});

// Task 7: Login as a Registered user
app.post("/api/users/login", (req, res) => {
  const { username, password } = req.body;

  // Find the user by username and password
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  res.json({ message: "Login successful", user });
});

// Task 8: Add/Modify a book review by Registered user
app.put("/api/books/:bookId/review", (req, res) => {
  const { bookId } = req.params;
  const { review, username, password } = req.body;

  // Find the user by username and password
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Find the book by ID
  const bookIndex = books.findIndex((b) => b.id.toString() === bookId);
  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Check if the user has already reviewed this book
  const existingReviewIndex = books[bookIndex].reviews.findIndex(
    (r) => r.username === username
  );
  if (existingReviewIndex !== -1) {
    // Modify the existing review
    books[bookIndex].reviews[existingReviewIndex].review = review;
    res.json({
      message: "Book review modified successfully",
      reviews: books[bookIndex].reviews,
    });
  } else {
    // Add a new review for the book by the user
    books[bookIndex].reviews.push({ username, review });
    res.json({
      message: "Book review added successfully",
      reviews: books[bookIndex].reviews,
    });
  }
});

// Task 9: Delete book review added by that particular user
app.delete("/api/books/:bookId/review", (req, res) => {
  const { bookId } = req.params;
  const { username, password } = req.body;

  // Find the user by username and password
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Find the book by ID
  const bookIndex = books.findIndex((b) => b.id.toString() === bookId);
  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Find the index of the review added by the user for this book
  const reviewIndex = books[bookIndex].reviews.findIndex(
    (r) => r.username === username
  );
  if (reviewIndex !== -1) {
    // Delete the review
    books[bookIndex].reviews.splice(reviewIndex, 1);
    res.json({ message: "Book review deleted successfully" });
  } else {
    res.status(404).json({ error: "Review not found for this user and book" });
  }
});

// Task 10: Get all books – Using async callback function
app.get("/api/books/callback", async (req, res) => {
  try {
    const allBooks = await getAllBooksAsyncCallback();
    res.json(allBooks);
  } catch (error) {
    console.error("Error getting all books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Task 11: Search by ISBN – Using Promises
app.get("/api/books/search/isbn/:isbn", (req, res) => {
  const { isbn } = req.params;
  searchByISBN(isbn)
    .then((result) => res.json(result))
    .catch((error) => res.status(500).json({ error: "Internal server error" }));
});

// Task 12: Search by Author
app.get("/api/books/search/author/:author", async (req, res) => {
  const { author } = req.params;
  try {
    const result = await searchByAuthor(author);
    res.json(result);
  } catch (error) {
    console.error("Error searching by Author:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Task 13: Search by Title
app.get("/api/books/search/title/:title", async (req, res) => {
  const { title } = req.params;
  try {
    const result = await searchByTitle(title);
    res.json(result);
  } catch (error) {
    console.error("Error searching by Title:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function getAllBooksAsyncCallback() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 1000);
  });
}

function searchByISBN(isbn) {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://localhost:3000/api/books/${isbn}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

async function searchByAuthor(author) {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/books/author/${author}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function searchByTitle(title) {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/books/title/${title}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
