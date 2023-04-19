const {check} = require('express-validator');

var Validate = [

    check('libelle').notEmpty().withMessage('Libelle obligatoire').trim().escape(),
    check('description').notEmpty().withMessage('Description obligatoire').trim(),
    check('prix').notEmpty().withMessage('Prix obligatoire').isNumeric().withMessage('Prix Seules les décimales sont autorisées, ou remplacer la virgule par point.').trim().escape(),
    check('maxqty').notEmpty().withMessage('Quantité obligatoire').isNumeric().withMessage('Quntité seules les décimales sont autorisées').trim().escape(),

];

module.exports = (app, sessionChecker) => {

    const produitsController = require("./../../../controllers/admin/produits.controller");

    var router = require("express").Router();

    router.get("/produits", [sessionChecker], produitsController.list);
    router.get("/produits/degustations", [sessionChecker], produitsController.list_degustations);
    router.get("/produits/degustations/add", sessionChecker, produitsController.add_degustations);
    router.post("/produits/degustations/create", [sessionChecker], produitsController.create_degustations);
    router.get("/produits/add", sessionChecker, produitsController.add);
    router.post("/produits/create", [sessionChecker,Validate], produitsController.create);
    router.post("/produits/delete/:id", sessionChecker, produitsController.delete);
    router.get("/produits/edit/:id", sessionChecker, produitsController.edit);
    router.post("/produits/update", [sessionChecker,Validate], produitsController.update);

    app.use('/admin', router);

}
