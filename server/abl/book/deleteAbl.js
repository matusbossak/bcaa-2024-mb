const Ajv = require("ajv");
const ajv = new Ajv();

const bookDao = require("../../dao/bookDao.js");
const borrowDao = require("../../dao/borrowDao.js");

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

    // Lists
    const borrowList = borrowDao.list();

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

    // Check if book exists
    const existingBook = bookDao.get(reqParams.id);
    if (!existingBook) {
      res.status(404).json({
        code: "bookNotFound",
        message: `Book with ID ${book.id} not found`,
      });
      return;
    }

    // Can't remove book if used in borrow
    const borrowedBook = borrowList.some((u) => u.book === reqParams.id);
    if (borrowedBook) {
      res.status(400).json({
        code: "bookInBorrow",
        message: `Can't remove book that is used in borrow'`,
      });
      return;
    }

    // Remove book
    bookDao.remove(reqParams.id);

    // Send response with empty object
    res.json({});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = DeleteAbl;
