const userDao = require("../../dao/userDao.js");

const ListAbl = async (req, res) => {
  try {
    // Request body or query string
    const reqParams = req.query?.role ? req.query : req.body;

    // List users
    let userList = userDao.list();

    // Filter roles if specified in the request
    const role = reqParams.role;

    if (role) {
      userList = userList.filter((user) => user.role === role);
    }

    // Send response
    res.json(userList);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = ListAbl;
