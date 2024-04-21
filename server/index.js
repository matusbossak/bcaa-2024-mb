const express = require("express");
const cors = require("cors");
const app = express();

// Controller
const userController = require("./controller/user");
const libraryController = require("./controller/library");
const borrowController = require("./controller/borrow");
const bookController = require("./controller/book");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Routes
app.use("/user", userController);
app.use("/library", libraryController);
app.use("/borrow", borrowController);
app.use("/book", bookController);

const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
