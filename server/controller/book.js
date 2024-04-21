const express = require("express");
const router = express.Router();

const GetAbl = require("../abl/book/getAbl");
const ListAbl = require("../abl/book/listAbl");
const CreateAbl = require("../abl/book/createAbl");
const UpdateAbl = require("../abl/book/updateAbl");
const DeleteAbl = require("../abl/book/deleteAbl");

router.get("/get", GetAbl);
router.get("/list", ListAbl);
router.post("/create", CreateAbl);
router.post("/update", UpdateAbl);
router.post("/delete", DeleteAbl);

module.exports = router;