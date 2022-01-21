const express = require("express");
const checkToken = require("../helpers/checkToken");
const r = require("../helpers/ristrictTo");
const {
  getAllTestCases,
  getTestCase,
  executeTestCase,
  deleteTestCase,
  summaryView,
  GetTestCaseHistory
} = require("../controllers/testCaseController");
const router = express.Router();

router.use(checkToken);

router.route("/execute").post(executeTestCase);

router.route("/:testCaseName/view").get(summaryView);

router.route("/:testCaseName/history").get(GetTestCaseHistory);

router.route("/").get(getAllTestCases);
//.post(createTestCase);

router.route("/:testCaseName").get(getTestCase).delete(deleteTestCase);

module.exports = router;
