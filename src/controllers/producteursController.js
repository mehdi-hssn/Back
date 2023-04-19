var util = require('util');
var multer = require('multer');
const {cnx} = require("./../models");
const query = util.promisify(cnx.query).bind(cnx);
const fs = require('fs');
const transporter = require('./../config/mail.config');
const prixHelper = require('./../helpers/prixHelper');

module.exports = {
    producteurFrancoPort: async function(req, res) {

        let id = req.param('id');
        let user_id = req.param('user_id');
        let franco_port = {id_producteur:id,prix:0,unite:'',national:false,region:0,franco_port:false};

        const producteur = await query('SELECT DISTINCT p.id,p.*,r.name as region,r.img as region_img,c.name as commune,c.numero as commune_numero,u.last_name FROM producteur p left join region r ON p.region_id = r.id left join commune c ON p.commune_id = c.id left join produit pr ON p.id = pr.producteur_id left join departement d ON p.departement_id = d.id left join user u ON u.id = p.user_id WHERE p.id = ?', [id]);

        if(producteur[0].franco_port == 0) {

            const region_id = await query('SELECT region_id FROM user WHERE id = ?', [user_id]);
            const f_p = await query('SELECT * FROM franco_port WHERE producteur_id = ? and region_id = ?', [producteur[0].user_id,region_id[0].region_id]);

            if(f_p.length) {
                franco_port.franco_port = true;
                franco_port.prix = f_p[0].prix;
                franco_port.unite = f_p[0].unite;
                franco_port.national = false;
                franco_port.region = region_id[0].region_id;
            }

            if(f_p.length == 0) {
                franco_port.franco_port = true;
                franco_port.prix = producteur[0].national_prix;
                franco_port.unite = producteur[0].national_unite;
                franco_port.national = true;
                franco_port.region = 0;
            }

        }

        if(producteur[0].franco_port == 1) {

            franco_port.prix = producteur[0].minimum_commande;
            franco_port.unite = producteur[0].unite;
        }

        res.json(franco_port);

    },
    findOneById: async function (req, res) {

        let id = req.param('id');

        const producteur = await query('SELECT DISTINCT p.id,p.*,r.name as region,r.img as region_img,c.name as commune,c.numero as commune_numero,u.last_name FROM producteur p left join region r ON p.region_id = r.id left join commune c ON p.commune_id = c.id left join produit pr ON p.id = pr.producteur_id left join departement d ON p.departement_id = d.id left join user u ON u.id = p.user_id WHERE p.id = ?', [id]);

        for (let i = 0; i< producteur.length; i++) {

            const categories = await query('SELECT c.* FROM producteur p inner join producteur_categorie pc ON p.id = pc.producteur_id inner join categorie c ON pc.categorie_id = c.id WHERE c.actif = 1 and p.id = ?', [producteur[i].id]);
            producteur[i].categories = categories;

        }


        res.json(producteur);

    }
    ,
    allWeek: async function (req, res) {

        let sql = 'SELECT DISTINCT p.id,p.*,r.name as region,r.img as region_img,r.id as region_id,c.name as commune,c.numero as commune_numero FROM producteur p left join region r ON p.region_id = r.id left join commune c ON p.commune_id = c.id left join produit pr ON p.id = pr.producteur_id WHERE p.actif = 1 and p.week = 1';

        const producteur = await query(sql, []);

        for (var i = 0; i< producteur.length; i++) {

            const products = await query('SELECT pr.* FROM producteur p inner join produit pr ON p.id = pr.producteur_id WHERE pr.actif = 1 and p.id = ?', [producteur[i].id]);

            for (var j = 0; j < products.length; j++) {
                products[j].prix_final = prixHelper.calculerLePrix(products[j],producteur[i]);
            }

            producteur[i].products = products;

            const categories = await query('SELECT c.* FROM producteur p inner join producteur_categorie pc ON p.id = pc.producteur_id inner join categorie c ON pc.categorie_id = c.id WHERE p.id = ?', [producteur[i].id]);
            producteur[i].categories = categories;

        }

        res.json(producteur);

    },

    all: async function (req, res) {

        let filter = {produits:'',departement:'',region:''};
        try {
            if(req.param('filter') != undefined && req.param('filter') != null){
                filter = await JSON.parse(req.param('filter'));
            }
        }catch (e) {
            console.log(e);
        }


        let produits = await (filter.produits != '' ? filter.produits.split(",") : []);
        let departement = await (filter.departement != '' ? filter.departement.split(",") : []);
        let region = await (filter.region != '' ? filter.region.split(",") : []);

        let sql = 'SELECT DISTINCT p.id,p.*,r.name as region,r.img as region_img,c.name as commune,c.numero as commune_numero,u.last_name FROM producteur p left join region r ON p.region_id = r.id left join commune c ON p.commune_id = c.id left join produit pr ON p.id = pr.producteur_id left join departement d ON p.departement_id = d.id left join user u ON u.id = p.user_id';

        // if(region.length > 0 || produits.length > 0 || departement.length > 0) {
        //     sql += ' WHERE ';
        // }

        sql += ' WHERE ';

        for(let j = 0; j< region.length; j++){
            if( j == 0){
                sql += ' (';
            }
            sql += ' r.map_id = "'+region[j]+'" ';
            if(region.length > j + 1){
                sql += ' OR ';
            }
            if(region.length == j + 1){
                sql += ' ) ';
            }
        }

        for(let j = 0; j< departement.length; j++){
            if(j == 0){
                if(filter.region != ''){
                    sql += ' AND ';
                }
                sql += ' (';
            }
            sql += ' d.id = '+departement[j]+' ';
            if(departement.length > j + 1){
                sql += ' OR ';
            }
            if(departement.length == j + 1){
                sql += ' ) ';
            }
        }

        for(let j = 0; j< produits.length; j++){
            if( j == 0){
                if(filter.region != '' || filter.departement != ''){
                    sql += ' AND ';
                }
                sql += ' (';
            }
            sql += ' pr.categorie_id = '+produits[j]+' ';
            if(produits.length > j + 1){
                sql += ' OR ';
            }
            if(produits.length == j + 1){
                sql += ' ) ';
            }
        }

        if(region.length > 0 || produits.length > 0 || departement.length > 0) {
            sql += ' AND ';
        }

        sql += ' p.actif = 1 ';

        const producteur = await query(sql, []);

        for (let i = 0; i< producteur.length; i++) {

            const products = await query('SELECT pr.* FROM producteur p inner join produit pr ON p.id = pr.producteur_id WHERE pr.actif = 1 and p.id = ?', [producteur[i].id]);

            for (var j = 0; j < products.length; j++) {

                products[j].prix_final = prixHelper.calculerLePrix(products[j],producteur[i]);

            }

            producteur[i].products = products;

            const categories = await query('SELECT c.* FROM producteur p inner join producteur_categorie pc ON p.id = pc.producteur_id inner join categorie c ON pc.categorie_id = c.id WHERE c.actif = 1 and p.id = ?', [producteur[i].id]);
            producteur[i].categories = categories;

        }

        res.json(producteur);

    },

    find: async function (req, res) {

        let producteur_id = req.param('ref');

        const producteur = await query('SELECT p.*,c.name as commune,c.numero as commune_numero,r.name as region,r.img as region_img FROM producteur p left join commune c ON p.commune_id = c.id left join region r ON r.id = p.region_id WHERE p.id = ? and p.actif = 1', [producteur_id]);

        res.json(producteur);

    }
    ,
    getTypeProduitProducteur: async function (req, res) {

        let producteur_id = req.param('ref');

        const type = await query('SELECT t.id,t.name as type,count(pr.id) as count FROM producteur p inner join produit pr ON p.id = pr.producteur_id inner join type t ON t.id = pr.type_id WHERE p.id = ? group by t.id', [producteur_id]);


        res.json(type);

    }
    ,
    getCategorieProduitProducteur: async function (req, res) {

        let producteur_id = req.param('ref');

        const type = await query('SELECT cp.id,cp.name as categorie,count(pr.id) as count FROM producteur p inner join produit pr ON p.id = pr.producteur_id inner join categorie_produit cp ON cp.id = pr.categorie_produit_id WHERE p.id = ? group by cp.id', [producteur_id]);

        res.json(type);

    }
    ,
    setFavorite: async function (req, res) {

        let producteur_id = req.param('producteur_id');
        let epicerie_id = req.param('epicerie_id');

        let epicier_producteur = {
            affectedRows: 1,
        };

        const epicier_producteur_exist = await query('SELECT * FROM epicier_producteur WHERE producteur_id = ? and epicier_id = ?', [producteur_id,epicerie_id]);

        if(epicier_producteur_exist.length == 0){
            epicier_producteur = await query('INSERT INTO epicier_producteur (producteur_id, epicier_id) VALUES (?,?)', [producteur_id,epicerie_id]);
        }

        res.json(epicier_producteur);

    }

}
