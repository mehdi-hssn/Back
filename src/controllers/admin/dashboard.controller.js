const {db} = require("./../../models");
const Produit = db.produit;
const Categorie = db.categorie;
const Type = db.type;
const CategorieProduit = db.categorie_produit;
const Feature = db.feature;
const Producteur = db.producteur;
const User = db.user;
const Ville = db.ville;
const Commune = db.commune;
const Departement = db.departement;
const Region = db.region;
const Epicier = db.epicier;
const Op = db.Sequelize.Op;
const fs = require('fs');

exports.index = async (req, res) => {

    res.render('admin/dashboard/index', {});

};
