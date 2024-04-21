const libraryDao = require("../../dao/libraryDao.js");

const ListAbl = async (req, res) => {
  try {
    // List libraries
    const libraryList = libraryDao.list();

    // Send response
    res.json(libraryList);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = ListAbl;