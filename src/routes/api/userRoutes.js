module.exports = app => {
    const router = require("express").Router();
    const {userController} = require("./../../controllers/");

    //app web
    router.post("/user/save-region", userController.saveRegion);
    router.get("/users", userController.find);
    router.post(`/user/create`, userController.register);
    router.post(`/user/create/facebook`, userController.registerFacebook);
    router.post(`/user/create/google`, userController.registerGoogle);
    router.post(`/user/confirmation/:token`, userController.confirmation);
    router.post(`/user/reset`, userController.resetPassword);
    router.post(`/user/login`, userController.login);
    router.post(`/user/forgot-mail-send`, userController.sendMailForgotPassword);
    router.get("/user/:id", userController.findOne);
    router.post("/user/:id", userController.update);
    router.post("/user/password/:id", userController.updatePassword);
    router.get(`/user/email/:email`, userController.findByEmail);


    app.use('/api', router);
}
