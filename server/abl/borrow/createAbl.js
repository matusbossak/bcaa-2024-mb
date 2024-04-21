const Ajv = require("ajv");
const ajv = new Ajv();
const getCurrentDateTime = require("../../helpers/getCurrentDateTime.js");
const validateDateTime = require("../../helpers/validateDateTime.js");
ajv.addFormat("date-time", { validate: validateDateTime });

const userDao = require("../../dao/userDao.js");
const libraryDao = require("../../dao/libraryDao.js");
const borrowDao = require("../../dao/borrowDao.js");
const bookDao = require("../../dao/bookDao.js");

const schema = {
  type: "object",
  properties: {
    user: { type: "string", minLength: 16, maxLength: 16 },
    library: { type: "string", minLength: 16, maxLength: 16 },
    book: { type: "string", minLength: 16, maxLength: 16 },
    dueDate: { type: "string", format: "date-time" },
    status: { type: "string", enum: ["borrowed", "overdue", "returned"] },
  },
  required: ["user", "library", "book", "dueDate", "status"],
  additionalProperties: false,
};

const CreateAbl = async (req, res) => {
  try {
    // Request body
    const borrow = req.body;

    // Lists
    const userList = userDao.list();
    const libraryList = libraryDao.list();
    const bookList = bookDao.list();

    // Input validation
    const valid = ajv.validate(schema, borrow);
    if (!valid) {
      res.status(400).json({
        code: "inputDataNotValid",
        message: "Input data not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // Check if user exists
    const userExists = userList.some((u) => u.id === borrow.user && u.role === "reader");
    if (!userExists) {
      res.status(404).json({
        code: "userNotFound",
        message: `User with ID ${borrow.user} not found`,
      });
      return;
    }

    // Check if library exists
    const libraryExists = libraryList.some((u) => u.id === borrow.library);
    if (!libraryExists) {
      res.status(404).json({
        code: "libraryNotFound",
        message: `Library with ID ${borrow.library} not found`,
      });
      return;
    }

    // Check if book exists
    const bookExists = bookList.some((u) => u.id === borrow.book && u.type === "library");
    if (!bookExists) {
      res.status(404).json({
        code: "bookNotFound",
        message: `Book with ID ${borrow.book} not found`,
      });
      return;
    }

    // Check if the library has the book
    const libraryHasBook = bookList.some((u) => u.id === borrow.book && u.libraries.includes(borrow.library));
    if (!libraryHasBook) {
      res.status(404).json({
        code: "bookNotAvailable",
        message: `Book with ID ${borrow.library} is not available in library with ID ${borrow.library}`,
      });
      return;
    }

    // Due date validation
    const futureDate = getCurrentDateTime();
    futureDate.setDate(futureDate.getDate() + 3);
    const dueDate = new Date(borrow.dueDate);
    if (dueDate < futureDate) {
      res.status(404).json({
        code: "borrowDateLow",
        message: `Book cannot be borrowed for less than 3 days`,
      });
      return;
    }

    // Add current date as startDate
    borrow.startDate = getCurrentDateTime("formatted");

    // Create borrow
    const createdBorrow = borrowDao.create(borrow);

    // Send response
    res.json(createdBorrow);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = CreateAbl;
