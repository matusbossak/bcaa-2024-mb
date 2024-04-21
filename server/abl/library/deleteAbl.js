const Ajv = require("ajv");
const ajv = new Ajv();

const libraryDao = require("../../dao/libraryDao.js");
const userDao = require("../../dao/userDao.js");
const borrowDao = require("../../dao/borrowDao.js");
const bookDao = require("../../dao/bookDao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 16, maxLength: 16 },
  },
  required: ["id"],
  additionalProperties: false,
};

const DeleteAbl = async (req, res) => {
  try {
    // Request body or query string
    const reqParams = req.query?.id ? req.query : req.body;

    // List
    const userList = userDao.list();
    const libraryList = libraryDao.list();
    const borrowList = borrowDao.list();
    const bookList = bookDao.list();

    // Input validation
    const valid = ajv.validate(schema, reqParams);
    if (!valid) {
      res.status(400).json({
        code: "inputDataNotValid",
        message: "Input data not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // Library must exist
    const existingLibrary = libraryList.some((u) => u.id === reqParams.id);
    if (!existingLibrary) {
      res.status(404).json({
        code: "libraryNotFound",
        message: `Library with ID ${reqParams.id} not found`,
      });
      return;
    }

    // Library must not have assigned librarians
    const librariansInLibrary = userList.filter((u) => u.role === "librarian" && u.library === reqParams.id);
    if (librariansInLibrary.length > 0) {
      res.status(400).json({
        code: "libraryHasLibrarians",
        message: `Library with ID ${reqParams.id} has librarian assigned`,
      });
      return;
    }

    // Library must not be included in borrow
    const libraryInBorrow = borrowList.some((u) => u.library === reqParams.id);
    if (libraryInBorrow) {
      res.status(404).json({
        code: "libraryInBorrow",
        message: `Library with ID ${reqParams.id} is present in borrow`,
      });
      return;
    }

    // Library must not be included in book
    const libraryInBook = bookList.some((u) => u.type === "library" && u.libraries.includes(reqParams.id));
    if (libraryInBook) {
      res.status(404).json({
        code: "libraryInBook",
        message: `Library with ID ${reqParams.id} is present in library book`,
      });
      return;
    }

    // Delete library
    libraryDao.remove(reqParams.id);

    // Send response with empty object
    res.json({});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = DeleteAbl;
