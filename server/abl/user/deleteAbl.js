const Ajv = require("ajv");
const ajv = new Ajv();

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

    // Lists
    const userList = userDao.list();
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

    // The user must exist
    const existingUser = userList.some((u) => u.id === reqParams.id);
    if (!existingUser) {
      res.status(404).json({
        code: "userNotFound",
        message: `User with ID ${reqParams.id} not found`,
      });
      return;
    }

    // The user must not have borrows
    const userHasBorrow = borrowList.some((u) => u.user === reqParams.id);
    if (userHasBorrow) {
      res.status(404).json({
        code: "userHasBorrow",
        message: `User with ID ${reqParams.id} has borrow`,
      });
      return;
    }

    // The user must not have book
    const userHasCustomBook = bookList.some((u) => u.type === "custom" && u.user === reqParams.id);
    if (userHasCustomBook) {
      res.status(404).json({
        code: "userHasCustomBook",
        message: `User with ID ${reqParams.id} has custom book`,
      });
      return;
    }

    // Delete user
    userDao.remove(reqParams.id);

    // Send response with empty object
    res.json({});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = DeleteAbl;
