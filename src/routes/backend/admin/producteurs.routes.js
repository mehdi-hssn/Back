const {check} = require('express-validator');

var Validate = [

    check('name').notEmpty().withMessage('Nom du producteur obligatoire').trim().escape(),
    check('email').notEmpty().withMessage('E-mail obligatoire').isEmail().withMessage('E-mail n\'est pas valide').trim().escape(),
    check('description').notEmpty().withMessage('Description obligatoire').trim().escape(),
    check('ville').trim().escape(),
    check('region').notEmpty().withMessage('Region obligatoire').isInt({ min:1 }).withMessage('Séléctionner une region').trim().escape(),
    check('last_name').notEmpty().withMessage('Nom du gérant obligatoire').trim().escape(),

];

module.exports = (app,sessionChecker) => {

    const producteursController = require("./../../../controllers/admin/producteurs.controller");

    var router = require("express").Router();

    router.get("/producteurs", sessionChecker, producteursController.list);
    router.get("/producteurs/add", sessionChecker, producteursController.add);

    router.get("/producteurs/producteur/add/csv", sessionChecker, producteursController.addProducteurCsv);
    router.post("/producteurs/producteur/add/csv", sessionChecker, producteursController.addProducteurCsv);

    router.get("/producteurs/products/add/csv", sessionChecker, producteursController.addCsv);
    router.post("/producteurs/products/add/csv", sessionChecker, producteursController.addCsv);
    
    router.post("/producteurs/create", [sessionChecker,Validate], producteursController.create);
    router.post("/producteurs/delete/:id", sessionChecker, producteursController.delete);
    router.get("/producteurs/edit/:id", sessionChecker, producteursController.edit);
    router.post("/producteurs/update", [sessionChecker,Validate], producteursController.update);
    router.get("/producteurs/password", sessionChecker, producteursController.passwordReset);
    router.post("/producteurs/password", sessionChecker, producteursController.passwordReset);

    app.use('/admin', router);

}
