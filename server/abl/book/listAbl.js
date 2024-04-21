const bookDao = require("../../dao/bookDao.js");

const ListAbl = async (req, res) => {
  try {
    // Request body or query string
    const reqParams = req.query?.user || req.query?.library ? req.query : req.body;

    // List books
    let bookList = bookDao.list();

    // Filter books by user if specified in the request
    const user = reqParams.user;
    const library = reqParams.library;
    if (user) {
      bookList = bookList.filter((u) => u.type === "custom" && u.user === user);
    } else if (library) {
      // If not, show only library books due to the security reasons
      bookList = bookList.filter((u) => u.type === "library" && u.libraries.includes(library));
    } else {
      bookList = bookList.filter((u) => u.type === "library");
    }

    // Send response
    res.json(bookList);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = ListAbl;
