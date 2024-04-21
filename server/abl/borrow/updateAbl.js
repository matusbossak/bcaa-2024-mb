const Ajv = require("ajv");
const ajv = new Ajv();
const getCurrentDateTime = require("../../helpers/getCurrentDateTime.js");
const validateDateTime = require("../../helpers/validateDateTime.js");
ajv.addFormat("date-time", { validate: validateDateTime });

const borrowDao = require("../../dao/borrowDao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 16, maxLength: 16 },
    dueDate: { type: "string", format: "date-time" },
    status: { type: "string", enum: ["borrowed", "overdue", "returned"] },
  },
  required: ["id"],
  additionalProperties: false,
};

const UpdateAbl = async (req, res) => {
  try {
    // Request body
    const borrow = req.body;

    // Lists
    const borrowList = borrowDao.list();

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

    // Check if borrow exists
    const existingBorrow = borrowDao.get(borrow.id);
    if (!existingBorrow) {
      res.status(404).json({
        code: "borrowNotFound",
        message: `Borrow with ID ${borrow.id} not found`,
      });
      return;
    }

    // Due date validation
    if (borrow.dueDate) {
      const startDate = new Date(existingBorrow.startDate);
      startDate.setDate(startDate.getDate() + 3);
      const futureDate = getCurrentDateTime();
      futureDate.setDate(futureDate.getDate() + 1);
      const dueDate = new Date(borrow.dueDate);
      if (dueDate < futureDate || dueDate < startDate) {
        res.status(404).json({
          code: "borrowDateLow",
          message: `Book cannot be borrowed for less than 3 days and less than 1 day from now`,
        });
        return;
      }
    }

    // Update borrow
    const updatedBorrow = borrowDao.update(borrow);

    // Send response
    res.json(updatedBorrow);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = UpdateAbl;
