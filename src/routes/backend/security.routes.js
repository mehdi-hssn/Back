module.exports = app => {

    const securityController = require("./../../controllers/security.controller");

    var router = require("express").Router();

    router.get("/register/producteur", securityController.registerProducteur);
    router.post("/register/producteur", securityController.registerProducteur);

    router.get("/register/producteur/confirm/:token", securityController.registerProducteurConfirmation);

    router.get("/login", securityController.login);
    router.post("/login", securityController.login);
    router.get("/logout", securityController.logout);

    router.get("/reset-password", securityController.resetPassword);
    router.post("/reset-password", securityController.resetPassword);

    router.get("/register/producteur/password/:token", securityController.setResetPassword);
    router.post("/register/producteur/password/:token", securityController.setResetPassword);

    app.use('/', router);

}


