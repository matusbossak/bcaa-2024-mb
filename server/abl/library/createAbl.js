const Ajv = require("ajv");
const ajv = new Ajv();

const libraryDao = require("../../dao/libraryDao.js");

const schema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 3 },
  },
  required: ["name"],
  additionalProperties: false,
};

const CreateAbl = async (req, res) => {
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

    // Non-duplicate library name validation
    const nameExists = libraryList.some((u) => u.name === library.name);
    if (nameExists) {
      res.status(400).json({
        code: "libraryNameAlreadyExists",
        message: `Library with name ${library.name} already exists`,
      });
      return;
    }

    // Create library
    const createdLibrary = libraryDao.create(library);

    // Send response
    res.json(createdLibrary);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = CreateAbl;
