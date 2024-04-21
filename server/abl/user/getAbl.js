const Ajv = require("ajv");
const ajv = new Ajv();

const userDao = require("../../dao/userDao.js");

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

    // The user must exist
    const user = userDao.get(reqParams.id);
    if (!user) {
      res.status(404).json({
        code: "userNotFound",
        message: `User with ID ${reqParams.id} not found`,
      });
      return;
    }

    // Send the response
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = GetAbl;
