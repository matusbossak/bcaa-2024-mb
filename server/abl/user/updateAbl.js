const Ajv = require("ajv");
const addFormats = require("ajv-formats").default;
const ajv = new Ajv();
addFormats(ajv);

const userDao = require("../../dao/userDao.js");
const libraryDao = require("../../dao/libraryDao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 16, maxLength: 16 },
    firstName: { type: "string", minLength: 3 },
    lastName: { type: "string", minLength: 3 },
    email: { type: "string", format: "email" },
    library: { type: "string", minLength: 0, maxLength: 16 },
  },
  required: ["id"],
  additionalProperties: false,
};

const UpdateAbl = async (req, res) => {
  try {
    // Request body
    const user = req.body;

    // Lists
    const userList = userDao.list();
    const libraryList = libraryDao.list();

    // Input validation
    const valid = ajv.validate(schema, user);
    if (!valid) {
      res.status(400).json({
        code: "inputDataNotValid",
        message: "Input data not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // The user must exist
    const existingUser = userList.some((u) => u.id === user.id);
    if (!existingUser) {
      res.status(404).json({
        code: "userNotFound",
        message: `User with ID ${user.id} not found`,
      });
      return;
    }

    // Non-duplicate user email validation
    const emailExists = userList.some((u) => u.email === user.email && u.id !== user.id);
    if (emailExists) {
      res.status(400).json({
        code: "emailUsed",
        message: `Email address ${user.email} is already used`,
      });
      return;
    }

    // Only librarians can be assigned a library and the library must exist
    if (user.library) {
      const librarianExists = userList.some((u) => u.role === "librarian" && u.id === user.id);
      if (librarianExists) {
        const libraryExists = libraryList.some((u) => u.id === user.library);
        if (!libraryExists) {
          res.status(404).json({
            code: "libraryNotFound",
            message: `Library with ID ${user.library} not found`,
          });
          return;
        }
      } else {
        res.status(400).json({
          code: "userNotLibrarian",
          message: `User is not a librarian`,
        });
        return;
      }
    }

    // Update user
    const updatedUser = userDao.update(user);

    // Send the response
    res.json(updatedUser);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = UpdateAbl;
