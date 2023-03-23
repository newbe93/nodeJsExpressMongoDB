var router = require("express").Router();

router.use("/sub", require("./sub.js"));
module.exports = router;
