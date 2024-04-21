const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const libraryFolderPath = path.join(__dirname, "storage", "libraryList");

// Read library
const get = (libraryId) => {
  try {
    const filePath = path.join(libraryFolderPath, `${libraryId}.json`);
    const fileData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === "ENOENT") return null; // No entry
    throw { code: "failedToReadLibrary", message: error.message };
  }
};

// Write library
const create = (library) => {
  try {
    library.id = crypto.randomBytes(8).toString("hex");
    const filePath = path.join(libraryFolderPath, `${library.id}.json`);
    const fileData = JSON.stringify(library);
    fs.writeFileSync(filePath, fileData, "utf8");
    return library;
  } catch (error) {
    throw { code: "failedToCreateLibrary", message: error.message };
  }
};

// Update library
const update = (library) => {
  try {
    const currentLibrary = get(library.id);
    if (!currentLibrary) return null;
    const newLibrary = { ...currentLibrary, ...library };
    const filePath = path.join(libraryFolderPath, `${library.id}.json`);
    const fileData = JSON.stringify(newLibrary);
    fs.writeFileSync(filePath, fileData, "utf8");
    return newLibrary;
  } catch (error) {
    throw { code: "failedToUpdateLibrary", message: error.message };
  }
};

// Remove library
const remove = (libraryId) => {
  try {
    const filePath = path.join(libraryFolderPath, `${libraryId}.json`);
    fs.unlinkSync(filePath);
    return {};
  } catch (error) {
    if (error.code === "ENOENT") {
      // No entry
      return {};
    }
    throw { code: "failedToRemoveLibrary", message: error.message };
  }
};

// List libraries
const list = () => {
  try {
    const files = fs.readdirSync(libraryFolderPath);
    const libraryList = files.map((file) => {
      const fileData = fs.readFileSync(path.join(libraryFolderPath, file), "utf8");
      return JSON.parse(fileData);
    });
    return libraryList;
  } catch (error) {
    throw { code: "failedToListLibraries", message: error.message };
  }
};

module.exports = {
  get,
  create,
  update,
  remove,
  list,
};
