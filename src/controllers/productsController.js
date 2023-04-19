var util = require('util');
var multer = require('multer');
const {cnx} = require("./../models");
const query = util.promisify(cnx.query).bind(cnx);
const fs = require('fs');
const prixHelper = require('./../helpers/prixHelper')

module.exports = {

    getAll: async function (req, res) {

        let product = await query('SELECT * from produit where actif = 1 ');

        res.json(product);

    },
    getEpicurienCommandeProduct: async function (req, res) {

        let id = req.param('id');
        let commande_id = req.param('commande_id');
        let product = await query('SELECT * from produit where actif = 1 and id = ? LIMIT 1', [id]);

        const commande_expedition = await query('SELECT ce.* FROM commande_expedition ce inner join commande_globale cg ON ce.commande_id = cg.id WHERE cg.ref = ?', [commande_id]);

        product[0].prix_final = prixHelper.calculerLePrixEpicurien(product[0],commande_expedition[0]);

        res.json(product);

    },
    getProducts: async function (req, res) {

        let id = req.param('producteur_id');

        const producteur = await query('SELECT p.* FROM producteur p WHERE p.actif = 1 and p.id = ?', [id]);
        let products = await query('SELECT * from produit where actif = 1 and producteur_id = ?', [id]);

        for (var i = 0; i < products.length; i++) {

            products[i].prix_final = prixHelper.calculerLePrix(products[i],producteur[0]);

        }

        res.json(products);

    },
    getProducteurProducts: async function (req, res) {

        let id = req.param('producteur_id');

        let products = [];
        let result = [];
        if (req.query.filter != undefined) {
            let filter = JSON.parse(req.query.filter);

            let type = filter.type != '' ? filter.type.split(",") : [];
            let categorie = filter.categorie != '' ? filter.categorie.split(",") : [];

            let min = filter.min != undefined ? filter.min : 0;
            let max = filter.max != undefined ? filter.max : 0;

            let sql = 'SELECT * from produit where actif = 1 and producteur_id = ' + id + ' ';
            //and prix between ' + min + ' and ' + max

            for (let j = 0; j < type.length; j++) {
                if (j == 0) {
                    sql += ' AND (';
                }
                sql += ' type_id = ' + type[j] + ' ';
                if (type.length > j + 1) {
                    sql += ' OR ';
                }
                if (type.length == j + 1) {
                    sql += ' ) ';
                }
            }

            for (let j = 0; j < categorie.length; j++) {
                if (j == 0) {
                    // if (filter.type != '') {
                    //     sql += ' AND ';
                    // }
                    sql += ' AND (';
                }
                sql += ' categorie_produit_id = ' + categorie[j] + ' ';
                if (categorie.length > j + 1) {
                    sql += ' OR ';
                }
                if (categorie.length == j + 1) {
                    sql += ' ) ';
                }
            }


            products = await query(sql, []);

            const producteur = await query('SELECT p.* FROM producteur p WHERE p.actif = 1 and p.id = ?', [id]);

            for (var i = 0; i < products.length; i++) {

                products[i].prix_final = prixHelper.calculerLePrix(products[i],producteur[0]);

                if(parseFloat(products[i].prix_final) <= max && parseFloat(products[i].prix_final) >= min ){
                    result.push(products[i]);
                }

            }

        } else {

            result = await query('SELECT * from produit where actif = 1 and producteur_id = ?', [id]);
            const producteur = await query('SELECT p.* FROM producteur p WHERE p.actif = 1 and p.id = ?', [id]);

            for (var i = 0; i < result.length; i++) {

                result[i].prix_final = prixHelper.calculerLePrix(result[i],producteur[0]);

            }
        }



        res.json(result);

    },
    async statutUpdate(req, res) {

        let id = req.param('id');
        let statut = req.param('statut');

        let produit = await query('UPDATE produit set actif = ? WHERE id = ?', [
            statut,
            id
        ]);

        res.json(produit);

    },
}
