const express = require("express");
const router = express.Router();

const GetAbl = require("../abl/library/getAbl");
const ListAbl = require("../abl/library/listAbl");
const CreateAbl = require("../abl/library/createAbl");
const UpdateAbl = require("../abl/library/updateAbl");
const DeleteAbl = require("../abl/library/deleteAbl");

router.get("/get", GetAbl);
router.get("/list", ListAbl);
router.post("/create", CreateAbl);
router.post("/update", UpdateAbl);
router.post("/delete", DeleteAbl);

module.exports = router;