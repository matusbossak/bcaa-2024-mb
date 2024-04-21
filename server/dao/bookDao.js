const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const bookFolderPath = path.join(__dirname, "storage", "bookList");

// Read book
const get = (bookId) => {
  try {
    const filePath = path.join(bookFolderPath, `${bookId}.json`);
    const fileData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === "ENOENT") return null; // No entry
    throw { code: "failedToReadBook", message: error.message };
  }
};

// Write book
const create = (book) => {
  try {
    book.id = crypto.randomBytes(8).toString("hex");
    const filePath = path.join(bookFolderPath, `${book.id}.json`);
    const fileData = JSON.stringify(book);
    fs.writeFileSync(filePath, fileData, "utf8");
    return book;
  } catch (error) {
    throw { code: "failedToCreateBook", message: error.message };
  }
};

// Update book
const update = (book) => {
  try {
    const currentBook = get(book.id);
    if (!currentBook) return null;
    const newBook = { ...currentBook, ...book };
    const filePath = path.join(bookFolderPath, `${book.id}.json`);
    const fileData = JSON.stringify(newBook);
    fs.writeFileSync(filePath, fileData, "utf8");
    return newBook;
  } catch (error) {
    throw { code: "failedToUpdateBook", message: error.message };
  }
};

// Remove book
const remove = (bookId) => {
  try {
    const filePath = path.join(bookFolderPath, `${bookId}.json`);
    fs.unlinkSync(filePath);
    return {};
  } catch (error) {
    if (error.code === "ENOENT") {
      // No entry
      return {};
    }
    throw { code: "failedToRemoveBook", message: error.message };
  }
};

// List books
const list = () => {
  try {
    const files = fs.readdirSync(bookFolderPath);
    const bookList = files.map((file) => {
      const fileData = fs.readFileSync(path.join(bookFolderPath, file), "utf8");
      return JSON.parse(fileData);
    });
    return bookList;
  } catch (error) {
    throw { code: "failedToListBooks", message: error.message };
  }
};

module.exports = {
  get,
  create,
  update,
  remove,
  list,
};
