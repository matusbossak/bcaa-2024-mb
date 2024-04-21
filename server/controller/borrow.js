const express = require("express");
const router = express.Router();

const GetAbl = require("../abl/borrow/getAbl");
const ListAbl = require("../abl/borrow/listAbl");
const CreateAbl = require("../abl/borrow/createAbl");
const UpdateAbl = require("../abl/borrow/updateAbl");
const DeleteAbl = require("../abl/borrow/deleteAbl");

router.get("/get", GetAbl);
router.get("/list", ListAbl);
router.post("/create", CreateAbl);
router.post("/update", UpdateAbl);
router.post("/delete", DeleteAbl);

module.exports = router;