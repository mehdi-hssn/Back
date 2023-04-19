const {db} = require("./../../models");
const Produit = db.produit;
const Categorie = db.categorie;
const Producteur = db.producteur;
const Type = db.type;
const CategorieProduit = db.categorie_produit;
const ProducteurCategorie = db.producteur_categorie;
const feature = db.feature;
const Op = db.Sequelize.Op;
const fs = require('fs');
const {body, validationResult} = require('express-validator');
var Jimp = require('jimp');

exports.add = async (req, res) => {

    if (req.session.userId == undefined) {
        res.redirect('/login');
    }

    const errors = [];
    let user_id = req.session.userId;
    let producteur = [];
    let categorie = [];
    let type = [];
    let categorie_produit = [];

    await Producteur.findAll({where: {}})
        .then(data => {
            producteur = data;
        })
        .catch(err => {

            res.redirect('/login');

        });

    res.render('admin/produits/ajouter', {
        producteur: producteur,
        categorie: categorie,
        type: type,
        categorie_produit: categorie_produit,
        errors: errors
    });

};

// Create and Save a new products
exports.create = async (req, res) => {

    if (req.session.userId == undefined) {
        res.redirect('/login');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        let user_id = req.session.userId;

        let producteur = await Producteur.findAll({});
0
        let data = req.body;

        return res.render('admin/produits/ajouter', {
            producteur: producteur,
            errors: errors.array(),
            data: data
        });
    }

    function stripTagsContent(html) {
        return html.replace(/(<([^>]+)>)/gi, "");
      }

      function stripTagsAndNbsp(html) {
        return html.replace(/<[^>]*>|&nbsp;/g, '');
      }

      var descriptNettoye = stripTagsContent(req.body.description);

        var descriptNettoye2 = stripTagsAndNbsp(descriptNettoye);
    // Create a produit
    const produit = {
        libelle: req.body.libelle,
        description: descriptNettoye2,
        prix: req.body.prix,
        actif: req.body.actif,
        maxqty: req.body.maxqty,
        poids_brut: req.body.poids_brut,
    };

    if (req.files) {
        const myFile = req.files.img;
        let filename = (new Date().getTime()) + '-' + myFile.name;
        produit.img = `${filename}`;
    }

    let d = {};
    // Save Produit in the database
    await Produit.create(produit)
        .then(data => {
            d = data;
        })
        .catch(err => {

            res.redirect('/login');

        });

    if (req.files && d.id != undefined && d.img != undefined) {
        let img = req.files.img;

        if (img != undefined) {
            await img.mv(__dirname + `/../../../public/uploads/produit/${d.id}/${d.img}`, function (err) {
                if (err) {
                    console.log(err);
                    res.redirect('/login');
                }
            });

            try {
                const image = await Jimp.read(__dirname+`/../../../public/uploads/produit/${d.id}/${d.img}`);
                await image.background(0xffffffff).quality(100).cover(444, 472);
                await image.writeAsync(__dirname + `/../../../public/uploads/produit/${d.id}/444x472/${d.img}`);
            } catch (e) {
                console.log(e);
            }

            try{
                const image = await Jimp.read(__dirname+`/../../../public/uploads/produit/${d.id}/${d.img}`);
                await image.cover(480, 480).background(0xFFFFFFFF);
                await image.quality(100);
                await image.writeAsync(__dirname + `/../../../public/uploads/produit/${d.id}/480x480/${d.img}`);
            }catch (e) {
                console.log(e);
            }

        }

    }

    res.redirect('/admin/produits');

};

exports.list = async (req, res) => {

    var email = req.session.email,
        userId = req.session.userId;

    if (userId == null) {
        res.redirect("/login");
        return;
    }

    let produits = [];
    let producteurs = [];

    await Produit.findAll({
        where: {},
        order: [
            ['id', 'DESC'],
        ]
    }).then(data => {
        produits = data;
    }).catch(err => {
        console.log(err);
        res.redirect('/login');
    });

    for (let i = 0; i < produits.length; i++) {

        await Producteur.findOne({
            where: {id:produits[i].producteur_id},
            order: [
                ['id', 'DESC'],
            ]
        }).then(data => {
            produits[i].producteur = data;
        }).catch(err => {
            console.log(err);
            res.redirect('/login');
        });

    }

    res.render('admin/produits/list', {produits});

};

// Create and Save a new products
exports.edit = async (req, res) => {

    const id = req.params.id;
    const errors = [];
    let categorie = [];
    let type = [];
    let categorie_produit = [];
    let producteur = [];
    let produit = {};
    await Produit.findByPk(id, {
        include: [{all: true}],
    })
        .then((p) => {
            produit = p;
        })
        .catch((err) => {
            console.log(">> Error while finding tutorial: ", err);
        });

    console.log(produit);

    await Producteur.findAll({where: {}})
        .then(data => {
            producteur = data;
        })
        .catch(err => {
            res.redirect('/login');
        });


    res.render('admin/produits/modifier', {
        produit: produit,
        producteur: producteur,
        categorie: categorie,
        type: type,
        categorie_produit: categorie_produit,
        errors: errors
    });

};

// Update a products by the id in the request
exports.update = async (req, res) => {

    const id = req.body.id;

    const produit = await Produit.findOne({where: {id: id}});

    let categorie = [];
    let type = [];
    let categorie_produit = [];
    let producteur = [];

    console.log(produit);

    await Producteur.findAll({where: {}})
        .then(data => {
            producteur = data;
        })
        .catch(err => {
            res.redirect('/login');
        });


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('producteur/produits/modifier', {
            produit: produit,
            categorie: categorie,
            producteur: producteur,
            type: type,
            categorie_produit: categorie_produit,
            errors: errors.array()
        });
    }  

    function stripTagsContent(html) {
        return html.replace(/(<([^>]+)>)/gi, "");
      }

      function stripTagsAndNbsp(html) {
        return html.replace(/<[^>]*>|&nbsp;/g, '');
      }

      var descriptNettoye = stripTagsContent(req.body.description);

        var descriptNettoye2 = stripTagsAndNbsp(descriptNettoye);
        

    // Create a produit
    const p = {
        libelle: req.body.libelle,
        description: descriptNettoye2,
        prix: req.body.prix,
        actif: req.body.actif,
        maxqty: req.body.maxqty,
    };


    if (req.body.img == 1) {
        if (produit) {
            try {
                fs.unlinkSync(__dirname + `/../../../public/uploads/produit/${produit.id}/${produit.img}`);
                fs.unlinkSync(__dirname + `/../../../public/uploads/produit/${produit.id}/444x472/${produit.img}`);
                fs.unlinkSync(__dirname + `/../../../public/uploads/produit/${produit.id}/480x480/${produit.img}`);

            } catch (err) {
                console.error(err)
            }
        }
        p.img = null;
    }

    if (req.files) {

        const img = req.files.img;

        if (img != null) {

            if (produit) {
                try {
                    fs.unlinkSync(__dirname + `/../../../public/uploads/produit/${produit.id}/${produit.img}`);
                    fs.unlinkSync(__dirname + `/../../../public/uploads/produit/${produit.id}/444x472/${produit.img}`);
                    fs.unlinkSync(__dirname + `/../../../public/uploads/produit/${produit.id}/480x480/${produit.img}`);

                } catch (err) {
                    console.error(err)
                }
            }

            let filename = (new Date().getTime()) + '-' + img.name;

            await img.mv(__dirname + `/../../../public/uploads/produit/${produit.id}/${filename}`, function (err) {
                if (err) {
                    console.log(err);
                    res.redirect('/login');
                }
            });
            p.img = `${filename}`;

            try {
                const image = await Jimp.read(__dirname+`/../../../public/uploads/produit/${produit.id}/${produit.img}`);
                await image.background(0xffffffff).quality(100).cover(444, 472);
                await image.writeAsync(__dirname + `/../../../public/uploads/produit/${produit.id}/444x472/${produit.img}`);
            } catch (e) {
                console.log(e);
            }

            try{
                const image = await Jimp.read(__dirname+`/../../../public/uploads/produit/${produit.id}/${produit.img}`);
                await image.cover(480, 480).background(0xFFFFFFFF);
                await image.quality(100);
                await image.writeAsync(__dirname + `/../../../public/uploads/produit/${produit.id}/480x480/${produit.img}`);
            }catch (e) {
                console.log(e);
            }

        }

    }

    await Produit.update(p, {
        where: {id: id}
    })
        .then(num => {
            if (num == 1) {
                res.redirect('/admin/produits');
                // res.send({
                //   message: "Tutorial was updated successfully."
                // });
            } else {
                res.redirect('/admin/produits');
                // res.send({
                //   message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
                // });
            }
        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        });

};

// Delete a products with the specified id in the request
exports.delete = async (req, res) => {
    const id = req.params.id;

    const produit = await Produit.findOne({where: {id: id}});
    console.log(produit);

    if (produit) {
        try {
            fs.unlinkSync(__dirname + `/../../../public/uploads/produit/${produit.id}/${produit.img}`);
            fs.unlinkSync(__dirname + `/../../../public/uploads/produit/${produit.id}/444x472/${produit.img}`);
            fs.unlinkSync(__dirname + `/../../../public/uploads/produit/${produit.id}/480x480/${produit.img}`);
        } catch (err) {
            console.error(err)
        }
    }

    Produit.destroy({
        where: {id: id}
    })
        .then(num => {
            if (num == 1) {
                res.redirect('/admin/produits');

                // res.send({
                //   message: "Tutorial was deleted successfully!"
                // });
            } else {
                res.redirect('/admin/produits');

                // res.send({
                //   message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
                // });
            }
        }).catch(err => {
            console.log(err);
            res.redirect('/login');
        });
};


// Retrieve all degustations from the database.
exports.list_degustations = async (req, res) => {

    if (req.session.userId == undefined) {
        res.redirect('/login');
    }

    var produitId = req.query.produitId;

    if (produitId == null) {
        res.redirect("/login");
        return;
    }

    const produit = await Produit.findOne({where: {id: produitId}});

    if (produit == null) {
        res.redirect('/producteur/produits');
    }

    console.log(produit.tasting);

    let tasting = produit.tasting;

    console.log(tasting);

    res.render('producteur/produits/degustation_list', {tasting, produit: produit});

};

exports.add_degustations = async (req, res) => {

    if (req.session.userId == undefined) {
        res.redirect('/login');
    }

    var produitId = req.query.produitId;

    if (produitId == null) {
        res.redirect("/login");
        return;
    }

    const errors = [];
    let user_id = req.session.userId;

    const produit = await Produit.findOne({where: {id: produitId}});

    if (produit == null) {
        res.redirect('/producteur/produits');
    }

    console.log(produit.tasting);

    let tasting = produit.tasting;

    console.log(tasting);

    res.render('producteur/produits/degustations_ajouter', {produit: produit, errors: errors});

};

// Create and Save a new degustations
exports.create_degustations = async (req, res) => {

    if (req.session.userId == undefined) {
        res.redirect('/login');
    }

    let errors = [];

    if(req.body.nom == null || req.body.nom == ''){
        errors.push('Nom obligatoire.');
    }
    if(req.body.valeur == null || req.body.valeur == ''){
        errors.push('Valeur obligatoire.');
    }

    if (errors.length > 0) {

        let user_id = req.session.userId;

        let produit = await Produit.findOne({where: {id: req.body.produitId}});

        console.log('req.body');
        console.log(errors);

        let data = req.body;

        return res.render('producteur/produits/degustations_ajouter', {
            produit: produit,
            errors: errors,
            data: data
        });
    }

    let id = req.body.produitId;

    let produits = await Produit.findOne({where: {id: req.body.produitId}});

    let p = {};

    let tasting = produits.tasting;

    tasting[req.body.nom] = req.body.valeur;

    p.tasting = tasting;

    // Save Tasting in the database
    await Produit.update(p, {where: {id: id}})
        .then(data => {

            res.redirect('/producteur/produits/degustations?produitId=' + id);

        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        });

    res.redirect('/producteur/produits/degustations?produitId=' + id);

};


exports.edit_degustations = async (req, res) => {

    if (req.session.userId == undefined) {
        res.redirect('/login');
    }

    var produitId = req.query.produitId;
    var index = req.query.index;

    if (produitId == null) {
        res.redirect("/login");
        return;
    }

    const errors = [];
    let user_id = req.session.userId;

    const produit = await Produit.findOne({where: {id: produitId}});

    if (produit == null) {
        res.redirect('/producteur/produits');
    }

    console.log(produit.tasting);

    let tasting = produit.tasting;

    console.log(tasting[index]);

    res.render('producteur/produits/degustations_edit', {produit: produit,index:index,tasting:tasting, errors: errors});

};

// update a new degustations
exports.update_degustations = async (req, res) => {

    if (req.session.userId == undefined) {
        res.redirect('/login');
    }

    let id = req.body.produitId;
    let index = req.body.index;

    let errors = [];

    if(req.body.nom == null || req.body.nom == ''){
        errors.push('Nom obligatoire.');
    }
    if(req.body.valeur == null || req.body.valeur == ''){
        errors.push('Valeur obligatoire.');
    }

    if (errors.length > 0) {

        let user_id = req.session.userId;

        let produit = await Produit.findOne({where: {id: req.body.produitId}});
        let tasting = produit.tasting;

        console.log('req.body');
        console.log(errors);

        let data = req.body;

        return res.render('producteur/produits/degustations_edit', {
            produit: produit,index:index,tasting:tasting, errors: errors
        });
    }


    let produits = await Produit.findOne({where: {id: req.body.produitId}});

    let p = {};

    let tasting = produits.tasting;

    delete tasting[index];

    tasting[req.body.nom] = req.body.valeur;

    p.tasting = tasting;

    // Save Tasting in the database
    await Produit.update(p, {where: {id: id}})
        .then(data => {

            res.redirect('/producteur/produits/degustations?produitId=' + id);

        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        });

    res.redirect('/producteur/produits/degustations?produitId=' + id);

};


// Delete a products with the specified id in the request
exports.delete_degustations = async (req, res) => {

    let id = req.body.produitId;
    let index = req.body.index;

    let produits = await Produit.findOne({where: {id: id}});

    let p = {};

    let tasting = produits.tasting;

    delete tasting[index];

    p.tasting = tasting;

    await Produit.update(p, {where: {id: id}})
        .then(data => {

            res.redirect('/producteur/produits/degustations?produitId=' + id);

        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        });

    res.redirect('/producteur/produits/degustations?produitId=' + id);
};
