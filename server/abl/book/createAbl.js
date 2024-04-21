const Ajv = require("ajv");
const ajv = new Ajv();
const getCurrentDateTime = require("../../helpers/getCurrentDateTime.js");
const userDao = require("../../dao/userDao.js");
const libraryDao = require("../../dao/libraryDao.js");
const bookDao = require("../../dao/bookDao.js");

const schema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 3 },
    author: { type: "string", minLength: 3 },
    genre: { type: "string", minLength: 3 },
    publicationYear: { type: "string" },
    coverImageUrl: { type: "string" },
    description: { type: "string", minLength: 50 },
    type: { type: "string", enum: ["custom", "library"] },
    user: { type: "string", minLength: 16, maxLength: 16 },
    libraries: { type: "array", items: { type: "string", minLength: 16, maxLength: 16 } },
  },
  required: ["title", "author", "genre", "publicationYear", "coverImageUrl", "description", "type"],
  additionalProperties: false,
};

const CreateAbl = async (req, res) => {
  try {
    // Request body
    const book = req.body;

    // Lists
    const userList = userDao.list();
    const libraryList = libraryDao.list();

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

    // PublicationYear validation
    const currentYear = getCurrentDateTime().getFullYear();
    if (parseInt(book.publicationYear) > currentYear) {
      res.status(400).json({
        code: "invalidPublicationYear",
        message: "Publication year cannot be in the future",
      });
      return;
    }

    if (book.type === "custom") {
      // Can't assign a custom book to a library
      if (book.libraries) {
        res.status(400).json({
          code: "NoAssignCustomBook",
          message: `Can't assign custom book to a library`,
        });
        return;
      }

      // Custom book must be assigned to a specific user and the user must exist and have role reader
      if (!book.user) {
        res.status(400).json({
          code: "userMissing",
          message: `User ID is missing`,
        });
        return;
      } else {
        const userExists = userList.some((u) => u.id === book.user && u.role === "reader");
        if (!userExists) {
          res.status(404).json({
            code: "userNotFound",
            message: `User with ID ${book.user} not found`,
          });
          return;
        }
      }
    } else if (book.type === "library") {
      // Can't assign a specific user to a library book
      if (book.user) {
        res.status(400).json({
          code: "NoAssignLibraryBook",
          message: `Can't assign library book to a specific user`,
        });
        return;
      }

      // Check for valid libraries
      let validLibraries = [];
      if (book.libraries) {
        for (const libraryId of book.libraries) {
          const libraryExists = libraryList.some((u) => u.id === libraryId);
          if (libraryExists) {
            validLibraries.push(libraryId);
          }
        }
        book.libraries = validLibraries;
      }
    }

    // Create book
    const createdBook = bookDao.create(book);

    // Send response
    res.json(createdBook);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = CreateAbl;
