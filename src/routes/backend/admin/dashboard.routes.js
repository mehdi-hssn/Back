module.exports = (app,sessionChecker) => {

    const dashboardController = require("./../../../controllers/admin/dashboard.controller");

    var router = require("express").Router();

    router.get("/", sessionChecker, dashboardController.index);

    app.use('/admin', router);

}


