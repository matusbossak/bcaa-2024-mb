const Ajv = require("ajv");
const ajv = new Ajv();

const libraryDao = require("../../dao/libraryDao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 16, maxLength: 16 },
    name: { type: "string", minLength: 3 },
  },
  required: ["id"],
  additionalProperties: false,
};

const UpdateAbl = async (req, res) => {
  try {
    // Request body
    const library = req.body;

    // List
    const libraryList = libraryDao.list();

    // Input validation
    const valid = ajv.validate(schema, library);
    if (!valid) {
      res.status(400).json({
        code: "inputDataNotValid",
        message: "Input data not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // The library must exist
    const existingLibrary = libraryList.some((u) => u.id === library.id);
    if (!existingLibrary) {
      res.status(404).json({
        code: "libraryNotFound",
        message: `Library with ID ${library.id} not found`,
      });
      return;
    }

    // Non-duplicate library name validation
    const nameExists = libraryList.some((u) => u.name === library.name && u.id !== library.id);
    if (nameExists) {
      res.status(400).json({
        code: "libraryNameAlreadyExists",
        message: `Library with name ${library.name} already exists`,
      });
      return;
    }

    // Update library
    const updatedLibrary = userDao.update(library);

    // Send response
    res.json(updatedLibrary);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = UpdateAbl;
