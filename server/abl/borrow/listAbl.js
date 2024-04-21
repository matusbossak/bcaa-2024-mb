const borrowDao = require("../../dao/borrowDao.js");

const ListAbl = async (req, res) => {
  try {
    // Request body or query string
    const reqParams = req.query?.user || req.query?.library ? req.query : req.body;

    // List books
    let borrowList = borrowDao.list();

    // Filter borrows by user and/or library if specified in the request
    /*const user = reqParams.user;
    const library = reqParams.library;
    if (user && library) {
      borrowList = borrowList.filter((u) => u.user === user && u.library === library);
    } else if (user && !library) {
      borrowList = borrowList.filter((u) => u.user === user);
    } else if (!user && library) {
      borrowList = borrowList.filter((u) => u.library === library);
    }*/

    borrowList = borrowList.filter(u => (!reqParams.user || u.user === reqParams.user) && (!reqParams.library || u.library === reqParams.library));

    // Send response
    res.json(borrowList);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = ListAbl;
