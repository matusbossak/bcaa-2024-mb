const Ajv = require("ajv");
const ajv = new Ajv();

const borrowDao = require("../../dao/borrowDao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 16, maxLength: 16 },
  },
  required: ["id"],
  additionalProperties: false,
};

const GetAbl = async (req, res) => {
  try {
    // Request body or query string
    const reqParams = req.query?.id ? req.query : req.body;

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

    // Borrow must exist
    const borrow = borrowDao.get(reqParams.id);
    if (!borrow) {
      res.status(404).json({
        code: "borrowNotFound",
        message: `Borrow with ID ${reqParams.id} not found`,
      });
      return;
    }

    // Send response
    res.json(reqParams.id);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = GetAbl;
