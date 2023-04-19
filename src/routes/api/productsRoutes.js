module.exports = app => {
    const router = require("express").Router();
    const {productsController} = require("./../../controllers/");

    router.get(`/products/:producteur_id`, productsController.getProducteurProducts);
    router.get(`/producteurs-products/:producteur_id`, productsController.getProducts);
    router.get(`/product/all`, productsController.getAll);
    router.get(`/epicurien-commande-product/:id/:commande_id`, productsController.getEpicurienCommandeProduct);
    router.post(`/produit/actif/update`, productsController.statutUpdate);

    app.use('/api', router);
}
