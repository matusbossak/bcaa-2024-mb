const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const borrowFolderPath = path.join(__dirname, "storage", "borrowList");

// Read borrow
const get = (borrowId) => {
  try {
    const filePath = path.join(borrowFolderPath, `${borrowId}.json`);
    const fileData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === "ENOENT") return null; // No entry
    throw { code: "failedToReadBorrow", message: error.message };
  }
};

// Write borrow
const create = (borrow) => {
  try {
    borrow.id = crypto.randomBytes(8).toString("hex");
    const filePath = path.join(borrowFolderPath, `${borrow.id}.json`);
    const fileData = JSON.stringify(borrow);
    fs.writeFileSync(filePath, fileData, "utf8");
    return borrow;
  } catch (error) {
    throw { code: "failedToCreateBorrow", message: error.message };
  }
};

// Update borrow
const update = (borrow) => {
  try {
    const currentBorrow = get(borrow.id);
    if (!currentBorrow) return null;
    const newBorrow = { ...currentBorrow, ...borrow };
    const filePath = path.join(borrowFolderPath, `${borrow.id}.json`);
    const fileData = JSON.stringify(newBorrow);
    fs.writeFileSync(filePath, fileData, "utf8");
    return newBorrow;
  } catch (error) {
    throw { code: "failedToUpdateBorrow", message: error.message };
  }
};

// Remove borrow
const remove = (borrowId) => {
  try {
    const filePath = path.join(borrowFolderPath, `${borrowId}.json`);
    fs.unlinkSync(filePath);
    return {};
  } catch (error) {
    if (error.code === "ENOENT") {
      // No entry
      return {};
    }
    throw { code: "failedToRemoveBorrow", message: error.message };
  }
};

// List borrows
const list = () => {
  try {
    const files = fs.readdirSync(borrowFolderPath);
    const borrowList = files.map((file) => {
      const fileData = fs.readFileSync(path.join(borrowFolderPath, file), "utf8");
      return JSON.parse(fileData);
    });
    return borrowList;
  } catch (error) {
    throw { code: "failedToListBorrows", message: error.message };
  }
};

module.exports = {
  get,
  create,
  update,
  remove,
  list,
};
