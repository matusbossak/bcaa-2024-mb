const Ajv = require("ajv");
const ajv = new Ajv();
const addFormats = require("ajv-formats").default;
addFormats(ajv);

const userDao = require("../../dao/userDao.js");
const libraryDao = require("../../dao/libraryDao.js");

const schema = {
  type: "object",
  properties: {
    firstName: { type: "string", minLength: 3 },
    lastName: { type: "string", minLength: 3 },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: ["librarian", "reader"] },
    library: { type: "string", minLength: 16, maxLength: 16 },
  },
  required: ["firstName", "lastName", "email", "role"],
  additionalProperties: false,
};

const CreateAbl = async (req, res) => {
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

    // Non-duplicate user email validation
    const emailExists = userList.some((u) => u.email === user.email);
    if (emailExists) {
      res.status(400).json({
        code: "emailUsed",
        message: `Email address ${user.email} is already used`,
      });
      return;
    }

    // Librarian must be assigned a library
    if (user.role === "librarian") {
      if (user.library) {
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
          code: "libraryMissing",
          message: "Library missing",
        });
        return;
      }
    } else {
      if (user.library) {
        res.status(400).json({
          code: "userNotLibrarian",
          message: `User is not a librarian`,
        });
        return;
      }
    }

    // Create user
    const createdUser = userDao.create(user);

    // Send the response
    res.json(createdUser);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = CreateAbl;
