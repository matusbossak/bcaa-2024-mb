const Ajv = require("ajv");
const ajv = new Ajv();
const getCurrentDateTime = require("../../helpers/getCurrentDateTime.js");
const libraryDao = require("../../dao/libraryDao.js");
const bookDao = require("../../dao/bookDao.js");
const borrowDao = require("../../dao/borrowDao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 16, maxLength: 16 },
    title: { type: "string", minLength: 3 },
    author: { type: "string", minLength: 3 },
    genre: { type: "string", minLength: 3 },
    publicationYear: { type: "string" },
    coverImageUrl: { type: "string" },
    description: { type: "string", minLength: 50 },
    libraries: { type: "array", items: { type: "string", minLength: 16, maxLength: 16 } },
  },
  required: ["title", "author", "genre", "publicationYear", "coverImageUrl", "description"],
  additionalProperties: false,
};

const CreateAbl = async (req, res) => {
  try {
    // Request body
    const book = req.body;

    // Lists
    const libraryList = libraryDao.list();
    const borrowList = borrowDao.list();

    // Input validation
    const valid = ajv.validate(schema, book);
    if (!valid) {
      res.status(400).json({
        code: "inputDataNotValid",
        message: "Input data not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // Check if book exists
    const existingBook = bookDao.get(book.id);
    if (!existingBook) {
      res.status(404).json({
        code: "bookNotFound",
        message: `Book with ID ${book.id} not found`,
      });
      return;
    }

    // PublicationYear validation
    const currentYear = getCurrentDateTime().getFullYear();
    if (parseInt(book.publicationYear) > currentYear) {
      res.status(400).json({
        code: "invalidPublicationYear",
        message: "Publication year cannot be in the future",
      });
      return;
    }

    if (existingBook.type === "custom") {
      // Can't assign a custom book to a library
      if (book.libraries) {
        res.status(400).json({
          code: "NoAssignCustomBook",
          message: `Can't assign custom book to a library`,
        });
        return;
      }
    } else {
      // Check for valid libraries
      let validLibraries = [];
      if (book.libraries) {
        for (const libraryId of book.libraries) {
          const libraryExists = libraryList.some((u) => u.id === libraryId);
          if (libraryExists) {
            validLibraries.push(libraryId);
          }
        }
      }

      // Always include libraries that have currently borrowed books
      const borrowedLibraries = borrowList.map((borrow) => borrow.library);
      book.libraries = [...validLibraries, ...borrowedLibraries];
    }

    // Update book
    const updatedBook = bookDao.update(book);

    // Send response
    res.json(updatedBook);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = CreateAbl;
