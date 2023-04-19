module.exports = app => {
const router = require("express").Router();
const { producteursController } = require("./../../controllers/");

router.get(`/producteurs/franco-port/:id/:user_id`, producteursController.producteurFrancoPort);
router.get(`/producteurs/all-week`, producteursController.allWeek);
router.get(`/producteurs/all`, producteursController.all);
router.get(`/producteurs/:ref`, producteursController.find);
router.get(`/get-producteurs/:id`, producteursController.findOneById);
router.get(`/type-producteur/:ref`, producteursController.getTypeProduitProducteur);
router.get(`/categorie-produit-producteur/:ref`, producteursController.getCategorieProduitProducteur);
router.post(`/producteur-add-favorite`, producteursController.setFavorite);

    app.use('/api', router);
}
