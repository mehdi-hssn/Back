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
const Op = db.Sequelize.Op;
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require("bcrypt");
var Jimp = require('jimp');
const {body, validationResult} = require('express-validator');
const sharp = require('sharp');
const Resize = require('./../../helpers/resizeImageHelper');
const readXlsxFile = require('read-excel-file/node')
const reader = require('xlsx');


exports.addProducteurCsv = async (req, res, next) => {

    var email = req.session.email,
    userId = req.session.userId;

    if (userId == null) {
        res.redirect("/login");
        return;
    }

    var dataInserted = [];
    var dataNotInserted = [];

    console.log('producteurs/producteur/add/csv');

    if(req.body.action != undefined && req.body.action == 'add') {
        
        var data = [];
        
        const csvc = req.files.file_csv;
        await csvc.mv(__dirname+`/../../../public/uploads/producteur/${csvc.name}`);

        // Reading our test file
        const file = await reader.readFile(__dirname+`/../../../public/uploads/producteur/${csvc.name}`);
        
        const sheets = file.SheetNames;
        
        for(let i = 0; i < sheets.length; i++) {
            const temp = await reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
            await temp.forEach((res) => {data.push(res)})
        }

        console.log('ville-boutouba');

        for(let i = 0; i < data.length; i++) {

            let producteur = {};
            try {

                let ville = await Ville.findOne({where: {code: data[i]['ville']},attributes: ['id']});
                let region = await Region.findOne({where: {map_id: data[i]['region']},attributes: ['id']});
                let commune = await Commune.findOne({where: {numero: data[i]['commune']},attributes: ['id']});
                let departement = await Departement.findOne({where: {numero: data[i]['departement']},attributes: ['id']});
                let producteur_ville = await Ville.findOne({where: {code: data[i]['ville_producteur']},attributes: ['id']});
                let producteur_region = await Region.findOne({where: {map_id: data[i]['region_producteur']},attributes: ['id']});

                const u = {
                    first_name: data[i]['prenom'],
                    last_name: data[i]['nom'],
                    email: data[i]['email'],
                    password: data[i]['mot_de_passe'],
                    phone: data[i]['tel'],
                    actif: data[i]['actif'],
                    region_id: producteur_region != null ? producteur_region.id : null,
                    ville_id: producteur_ville != null ? producteur_ville.id : null 
                };

                user = await User.create(u);

                const o = {
                    user_id: user.id,
                    name: data[i]['nom'],
                    description: data[i]['description'],
                    ville_id: ville != null ? ville.id : null,
                    departement_id: departement != null ? departement.id : null,
                    region_id: region != null ? region.id : null,
                    commune_id: commune != null ? commune.id : null,
                    bg: data[i]['Fond_principal'],
                    block_bg: data[i]['Fond_secondaire'],
                    actif: data[i]['actif'],
                    week: data[i]['producteur_du_semaine'],
                    receipt_of_purchase_orders: JSON.parse(data[i]['receipt_of_purchase_orders']),
                    franco_port: data[i]['franco_port'],
                    minimum_commande: data[i]['minimum_de_commande'],
                    unite: data[i]['unite'],
                    cout_transport_kg: data[i]['cout_transport_par_kg'],
                    national_prix:data[i]['prix_national'],
                    national_unite: data[i]['unite_national'],
                    bio: data[i]['bio'],
                    fonction: JSON.parse(data[i]['fonction']),
                };

                producteur = await Producteur.create(o);
                dataInserted.push(o);

            } catch(e) {

                console.log(e);
                dataNotInserted.push({
                    name: data[i]['nom'] != undefined ? data[i]['nom'] : '',
                });

            }
                
        }

        await fs.unlinkSync(__dirname+`/../../../public/uploads/producteur/${csvc.name}`);
        res.render('admin/producteurs/ajouter_producteur_csv', {dataInserted:dataInserted,dataNotInserted:dataNotInserted});
        return;

    }

    res.render('admin/producteurs/ajouter_producteur_csv', {dataInserted:dataInserted,dataNotInserted:dataNotInserted});
    return;

}

exports.addCsv = async (req, res, next) => {

    const id = req.query.id;

    const producteur = await Producteur.findOne({
        where: {id:id}
    });

    var dataInserted = [];
    var dataNotInserted = [];

    if(req.body.action != undefined && req.body.action == 'add') {
        
        var data = [];
        
        const csvc = req.files.file_csv;
        await csvc.mv(__dirname+`/../../../public/uploads/producteur/${producteur.id}/${csvc.name}`);

        // Reading our test file
        const file = await reader.readFile(__dirname+`/../../../public/uploads/producteur/${producteur.id}/${csvc.name}`);
        
        const sheets = file.SheetNames;
        
        for(let i = 0; i < sheets.length; i++) {
            const temp = await reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
            await temp.forEach((res) => {data.push(res)})
        }

        for(let i = 0; i < data.length; i++) {

            let checkP= false;
            let produit = {};
            try {

                let cat = await Categorie.findOne({where: {code: data[i]['categorie']},attributes: ['id']});
                let cat_produit = await CategorieProduit.findOne({where: {code: data[i]['categorie produit']},attributes: ['id']});
                let type = await Type.findOne({where: {code: data[i]['type']},attributes: ['id']});

                const o = {
                    libelle: data[i]['libelle'],
                    prix: parseFloat(data[i]['prix']),
                    poids: data[i]['poids'],
                    type_poids: data[i]['type poids'],
                    prix_kg: parseFloat(data[i]['prix kg']),
                    producteur_id: producteur.id,
                    categorie_id: cat != undefined ? cat.id : null,
                    description: data[i]['description'],
                    tasting: JSON.parse(data[i]['degustation']),
                    categorie_produit_id: cat_produit != undefined ? cat_produit.id : null,
                    type_id: type != undefined ? type.id : null,
                    quantity: data[i]['quantite'],
                    tva: parseFloat(data[i]['tva']),
                    poids_brut: parseFloat(data[i]['poids brut']),
                    type_conditionnement: data[i]['type conditionnement'],
                    autre_type_conditionnement:data[i]['autre type conditionnement'],
                    conditionnee_par: parseInt(data[i]['conditionner par']),
                    actif: parseInt(data[i]['actif']),
                };
                produit = await Produit.create(o);
                dataInserted.push(o);

            } catch(e) {

                console.log(e);
                checkP = true;
                dataNotInserted.push({
                    libelle: data[i]['libelle'] != undefined ? data[i]['libelle'] : '',
                });

            }

            if(checkP == false && produit.id != undefined) {
                
                const carac = JSON.parse(data[i]['caracteristiques']);
    
                for(let j = 0; j < carac.length; j++) {
    
                    await Feature.create({produit_id:produit.id,nom:carac[j]["nom"],valeur:carac[j]["valeur"]});
    
                }
            }
                
        }

        console.log(dataInserted);
        console.log(dataNotInserted);
        await fs.unlinkSync(__dirname+`/../../../public/uploads/producteur/${producteur.id}/${csvc.name}`);
        res.render('admin/producteurs/ajouter_csv', {producteur:producteur,dataInserted:dataInserted,dataNotInserted:dataNotInserted});
        return;

    }

    res.render('admin/producteurs/ajouter_csv', {producteur:producteur,dataInserted:dataInserted,dataNotInserted:dataNotInserted});
    return;

}

exports.add = async (req, res) => {

    let ville = [];
    let commune = [];
    let region = [];
    let errors = [];
    let departement = [];
    ville = await Ville.findAll({});
    commune = await Commune.findAll({});
    region = await Region.findAll({});
    departement = await Departement.findAll({});

    res.render('admin/producteurs/ajouter', {ville: ville, commune: commune, region: region, departement: departement,errors: errors});

};

exports.create = async (req, res) => {

    let check_receipt_of_purchase_orders = false;
    let receipt_of_purchase_orders = [];

    if(req.body.receipt_of_purchase_orders_1 != undefined && req.body.receipt_of_purchase_orders_1_livraison != undefined && req.body.receipt_of_purchase_orders_1_livraison != '') {

        receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_1] = req.body.receipt_of_purchase_orders_1_livraison;
        check_receipt_of_purchase_orders = true;

    }

    if(req.body.receipt_of_purchase_orders_2 != undefined && req.body.receipt_of_purchase_orders_2_livraison != undefined && req.body.receipt_of_purchase_orders_2_livraison != '') {

        receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_2] = req.body.receipt_of_purchase_orders_2_livraison;
        check_receipt_of_purchase_orders = true;
    }

    if(req.body.receipt_of_purchase_orders_3 != undefined && req.body.receipt_of_purchase_orders_3_livraison != undefined && req.body.receipt_of_purchase_orders_3_livraison != '') {

        receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_3] = req.body.receipt_of_purchase_orders_3_livraison;
        check_receipt_of_purchase_orders = true;
    }

    if(req.body.receipt_of_purchase_orders_4 != undefined && req.body.receipt_of_purchase_orders_4_livraison != undefined && req.body.receipt_of_purchase_orders_4_livraison != '') {

        receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_4] = req.body.receipt_of_purchase_orders_4_livraison;
        check_receipt_of_purchase_orders = true;
    }

    if(req.body.receipt_of_purchase_orders_5 != undefined && req.body.receipt_of_purchase_orders_5_livraison != undefined && req.body.receipt_of_purchase_orders_5_livraison != ''){

        receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_5] = req.body.receipt_of_purchase_orders_5_livraison;
        check_receipt_of_purchase_orders = true;
    }

    if(req.body.receipt_of_purchase_orders_6 != undefined && req.body.receipt_of_purchase_orders_6_livraison != undefined && req.body.receipt_of_purchase_orders_6_livraison != ''){

        receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_6] = req.body.receipt_of_purchase_orders_6_livraison;
        check_receipt_of_purchase_orders = true;
    }

    if(req.body.receipt_of_purchase_orders_7 != undefined && req.body.receipt_of_purchase_orders_7_livraison != undefined && req.body.receipt_of_purchase_orders_7_livraison != ''){

        receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_7] = req.body.receipt_of_purchase_orders_7_livraison;
        check_receipt_of_purchase_orders = true;
    }
    const obj = Object.assign({}, receipt_of_purchase_orders);

    const errors = validationResult(req);
    if (!errors.isEmpty() || check_receipt_of_purchase_orders == false) {

        let user_id = req.session.userId;

        let ville = await Ville.findAll({});
        let commune = await Commune.findAll({});
        let region = await Region.findAll({});
        let departement = await Departement.findAll({});
        let user = await User.findByPk(user_id, {});
        let receipt_of_purchase_orders = [];
        let receipt_of_purchase_orders_livraison = [];

        console.log(receipt_of_purchase_orders);
        console.log(receipt_of_purchase_orders_livraison);

        let err = [];
        err = errors.array();
        err.push({msg:'Reception des bons de commandes obligatoire'});

        return res.render('admin/producteurs/ajouter', {
            receipt_of_purchase_orders: receipt_of_purchase_orders,
            receipt_of_purchase_orders_livraison: receipt_of_purchase_orders_livraison,
            user: user,
            ville: ville,
            commune: commune,
            region: region,
            departement: departement,
            errors: err
        });
    }

    console.log(req.body);

    let fonction = [];
    if(req.body.fonction != undefined) {
        fonction = req.body.fonction;
    }

    // Create a producteur
    const producteur = {
        name: req.body.name,
        description: req.body.description,
        bg: req.body.bg,
        block_bg: req.body.block_bg,
        ville_id: req.body.ville ? req.body.ville : 0,
        commune_id: req.body.commune,
        departement_id: req.body.departement,
        region_id: req.body.region,
        actif: req.body.visualiser,
        week: req.body.week,
        img: '',
        receipt_of_purchase_orders: obj,
        bio: req.body.bio,
        fonction: fonction,
    };


    if (req.files) {
        let img = req.files.img;

        if (img != undefined) {
            let filename = (new Date().getTime()) + '-' + img.name;
            producteur.img = `${filename}`;
        }

        let logo = req.files.logo;

        if (logo != undefined) {
            let filename_logo = (new Date().getTime()) + '-' + logo.name;
            producteur.logo = `${filename_logo}`;
        }

    }

    let bcypt_password = await bcrypt.hash(req.body.password, 8);

    const user = {
        last_name: req.body.last_name,
        email: req.body.email,
        password: bcypt_password,
        phone: req.body.phone,
        roles: '["ROLE_PRODUCTEUR"]',
        user_img: producteur.img,
        actif: req.body.actif,
    };

    await User.create(user).then(data => {
        producteur.user_id = data.id;
    }).catch(err => {
        res.redirect("/login");
        return;
    });

    let d = null;
    await Producteur.create(producteur)
        .then(data => {
            d = data;
        })
        .catch(err => {
            res.redirect("/login");
            return;
        });

    if (req.files && d.id != undefined) {
        let img = req.files.img;

        if (img != undefined && d.img != undefined) {
            await img.mv(__dirname+`/../../../public/uploads/producteur/${d.id}/${d.img}`, function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({msg: "Error occured"});
                }
            });

            try{
                const image = await Jimp.read(__dirname+`/../../../public/uploads/producteur/${d.id}/${d.img}`);
                await image.cover(350, 350).background(0xFFFFFFFF);
                await image.quality(100);
                await image.writeAsync(__dirname + `/../../../public/uploads/producteur/${d.id}/img/300x300/${d.img}`);
            }catch (e) {
                console.log(e);
            }

        }

        let logo = req.files.logo;

        if (logo != undefined && d.logo != undefined) {
            await logo.mv(__dirname+`/../../../public/uploads/producteur/${d.id}/${d.logo}`, function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({msg: "Error occured"});
                }
            });
            try {
                const l = await Jimp.read(__dirname+`/../../../public/uploads/producteur/${d.id}/${d.logo}`);
                await l.resize(300, 150).background(0xFFFFFFFF);
                await l.quality(100);
                await l.writeAsync(__dirname + `/../../../public/uploads/producteur/${d.id}/logo/300x300/${d.logo}`);
            }catch (e) {
                console.log(e);
            }

        }

    }

    res.redirect('/admin/producteurs');
};

exports.list = async (req, res) => {

    var email = req.session.email,
        userId = req.session.userId;

    if (userId == null) {
        res.redirect("/login");
        return;
    }

    let producteurs = [];

    producteurs = await Producteur.findAll({
        where: {}, order: [
            ['id', 'DESC'],
        ]
    });

    for (var i = 0; i < producteurs.length; i++) {

        producteurs[i].user = await User.findOne({where: {id: producteurs[i].user_id}});
        producteurs[i].departement = await Departement.findOne({where: {id: producteurs[i].departement_id}});
        producteurs[i].region = await Region.findOne({where: {id: producteurs[i].region_id}});
        producteurs[i].ville = await Ville.findOne({where: {id: producteurs[i].ville_id}});
        producteurs[i].commune = await Commune.findOne({where: {id: producteurs[i].commune_id}});
    }

    res.render('admin/producteurs/list', {producteurs: producteurs});

};

exports.edit = async (req, res) => {
    console.log(req.params);

    const id = req.params.id;
    let errors = [];
    let ville = [];
    let commune = [];
    let region = [];
    let departement = [];
    let user = {};

    let p = await Producteur.findOne({where:{id:id}}, {});
    ville = await Ville.findAll({});
    commune = await Commune.findAll({});
    region = await Region.findAll({});
    departement = await Departement.findAll({});

    let receipt_of_purchase_orders = [];
    let receipt_of_purchase_orders_livraison = [];

    if (p != null) {
        user = await User.findByPk(p.user_id, {});
        for (const property in p.receipt_of_purchase_orders) {
            receipt_of_purchase_orders.push(property);
            receipt_of_purchase_orders_livraison[property] = p.receipt_of_purchase_orders[property];
        }
    }
    
    res.render('admin/producteurs/modifier', {
        errors: errors,
        receipt_of_purchase_orders: receipt_of_purchase_orders,
        receipt_of_purchase_orders_livraison: receipt_of_purchase_orders_livraison,
        producteur: p, user: user, ville: ville, commune: commune, region: region, departement: departement
    });

};

exports.update = async (req, res) => {
    const id = req.body.id;

    try {

        const producteur = await Producteur.findOne({where: {id: id}});

        let check_receipt_of_purchase_orders = false;
        let receipt_of_purchase_orders = [];

        if(req.body.receipt_of_purchase_orders_1 != undefined && req.body.receipt_of_purchase_orders_1_livraison != undefined && req.body.receipt_of_purchase_orders_1_livraison != '') {

            receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_1] = req.body.receipt_of_purchase_orders_1_livraison;
            check_receipt_of_purchase_orders = true;

        }

        if(req.body.receipt_of_purchase_orders_2 != undefined && req.body.receipt_of_purchase_orders_2_livraison != undefined && req.body.receipt_of_purchase_orders_2_livraison != '') {

            receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_2] = req.body.receipt_of_purchase_orders_2_livraison;
            check_receipt_of_purchase_orders = true;
        }

        if(req.body.receipt_of_purchase_orders_3 != undefined && req.body.receipt_of_purchase_orders_3_livraison != undefined && req.body.receipt_of_purchase_orders_3_livraison != '') {

            receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_3] = req.body.receipt_of_purchase_orders_3_livraison;
            check_receipt_of_purchase_orders = true;
        }

        if(req.body.receipt_of_purchase_orders_4 != undefined && req.body.receipt_of_purchase_orders_4_livraison != undefined && req.body.receipt_of_purchase_orders_4_livraison != '') {

            receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_4] = req.body.receipt_of_purchase_orders_4_livraison;
            check_receipt_of_purchase_orders = true;
        }

        if(req.body.receipt_of_purchase_orders_5 != undefined && req.body.receipt_of_purchase_orders_5_livraison != undefined && req.body.receipt_of_purchase_orders_5_livraison != ''){

            receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_5] = req.body.receipt_of_purchase_orders_5_livraison;
            check_receipt_of_purchase_orders = true;
        }

        if(req.body.receipt_of_purchase_orders_6 != undefined && req.body.receipt_of_purchase_orders_6_livraison != undefined && req.body.receipt_of_purchase_orders_6_livraison != ''){

            receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_6] = req.body.receipt_of_purchase_orders_6_livraison;
            check_receipt_of_purchase_orders = true;
        }

        if(req.body.receipt_of_purchase_orders_7 != undefined && req.body.receipt_of_purchase_orders_7_livraison != undefined && req.body.receipt_of_purchase_orders_7_livraison != ''){

            receipt_of_purchase_orders[req.body.receipt_of_purchase_orders_7] = req.body.receipt_of_purchase_orders_7_livraison;
            check_receipt_of_purchase_orders = true;
        }
        const obj = Object.assign({}, receipt_of_purchase_orders);

        const errors = validationResult(req);
        if (!errors.isEmpty() || check_receipt_of_purchase_orders == false) {

            let user_id = req.session.userId;

            let ville = await Ville.findAll({});
            let commune = await Commune.findAll({});
            let region = await Region.findAll({});
            let departement = await Departement.findAll({});
            let user = await User.findByPk(user_id, {});
            let receipt_of_purchase_orders = [];
            let receipt_of_purchase_orders_livraison = [];

            let err = [];
            err = errors.array();
            err.push({msg:'Reception des bons de commandes obligatoire'});

            return res.render('admin/producteurs/modifier', {
                receipt_of_purchase_orders: receipt_of_purchase_orders,
                receipt_of_purchase_orders_livraison: receipt_of_purchase_orders_livraison,
                user: user,
                ville: ville,
                producteur: producteur,
                commune: commune,
                region: region,
                departement: departement,
                errors: err
            });
        }

        let fonction = [];
        if(req.body.fonction != undefined) {
            fonction = req.body.fonction;
        }

        const p = {
            name: req.body.name,
            description: req.body.description,
            bg: req.body.bg,
            block_bg: req.body.block_bg,
            ville_id: req.body.ville ? req.body.ville : 0,
            commune_id: req.body.commune,
            departement_id: req.body.departement,
            region_id: req.body.region,
            actif: req.body.visualiser,
            week: req.body.week,
            receipt_of_purchase_orders: obj,
            bio: req.body.bio,
            fonction: fonction,
        };

        let user = {
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            actif: req.body.actif,
        };

    
        if (req.body.logo == 1) {
            if (producteur) {
                try {
                    if(fs.existsSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/${producteur.logo}`)){
                        fs.unlinkSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/${producteur.logo}`);
    
                    }
                    if(fs.existsSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/logo/300x300/${producteur.logo}`)){
                        fs.unlinkSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/logo/300x300/${producteur.logo}`);
    
                    }
                } catch (err) {
                    console.error(err)
                }
            }
            p.logo = null;
        }

        console.log("22222222222");
    
        if (req.body.img == 1) {
            if (producteur) {
                try {
                    if(fs.existsSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/${producteur.img}`)) {
                        fs.unlinkSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/${producteur.img}`);
                    }
                    if(fs.existsSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/img/300x300/${producteur.img}`)) {
                        fs.unlinkSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/img/300x300/${producteur.img}`);
                    }
                } catch (err) {
                    console.error(err)
                }
            }
            p.img = null;
        }
    
        console.log("333333333");
        
        if (req.files) {
    
            const logo = req.files.logo;
            const img = req.files.img;

            console.log(logo);
            console.log(img);
            console.log(img.name);
            console.log(producteur.img);
    
            if (img != null && img.name != producteur.img) {

                console.log(producteur);
    
                if (producteur) {
                    try {
                        if(fs.existsSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/${producteur.img}`)) {
                            fs.unlinkSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/${producteur.img}`);
                        }
                        if(fs.existsSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/img/300x300/${producteur.img}`)) {
                            fs.unlinkSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/img/300x300/${producteur.img}`);
                        }
                    } catch (err) {
                        console.error(err)
                    }
                }
    
                let filename = (new Date().getTime()) + '-' + img.name;
                console.log(filename);
    
                await img.mv(__dirname + `/../../../public/uploads/producteur/${producteur.id}/${filename}`, function (err) {
                    if (err) {
                        console.log(err);
                    }
    
                });
                p.img = `${filename}`;
                user.user_img = p.img;

                console.log('p.img');
                console.log(p.img);
    
                try{
                    const image = await Jimp.read(__dirname+`/../../../public/uploads/producteur/${producteur.id}/${filename}`);
                    await image.cover(350, 350).background(0xFFFFFFFF);
                    await image.quality(100);
                    await image.writeAsync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/img/300x300/${p.img}`);
                }catch (e) {
                    console.log('image-error');
                    console.log(e);
                }
    
            }
    
            if (logo != null && logo.name != producteur.logo) {
    
                if (producteur) {
                    try {
                        if(fs.existsSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/${producteur.logo}`)) {
                            fs.unlinkSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/${producteur.logo}`);
                        }
                        if(fs.existsSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/logo/300x300/${producteur.logo}`)) {
                            fs.unlinkSync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/logo/300x300/${producteur.logo}`);
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
    
                let filename = (new Date().getTime()) + '-' + logo.name;
    
                await logo.mv(__dirname + `/../../../public/uploads/producteur/${producteur.id}/${filename}`, function (err) {
                    if (err) {
                        console.log(err);
                        //return res.status(500).send({msg: "Error occured"});
                    }
                });
                p.logo = `${filename}`;
    
                try {
                    const l = await Jimp.read(__dirname+`/../../../public/uploads/producteur/${producteur.id}/${filename}`);
                    await l.resize(300, 300);
                    await l.quality(100);
                    await l.writeAsync(__dirname + `/../../../public/uploads/producteur/${producteur.id}/logo/300x300/${p.logo}`);
                } catch (e) {
                    console.log(e);
                }
    
            }
    
        }    

        let u = await User.findOne({where:{id:producteur.user_id}});

        if(u == null) {

            let bcypt_password = await bcrypt.hash(req.body.email, 8);

            user = {
                last_name: req.body.last_name,
                email: req.body.email,
                password: bcypt_password,
                phone: req.body.phone,
                roles: 'ROLE_PRODUCTEUR',
                user_img: producteur.img,
                actif: req.body.actif,
            };
            console.log(user);

            await User.create(user).then(data => {
                p.user_id = data.id;
            }).catch(err => {
                res.redirect('/admin/producteurs');
            });
        } else {
            await User.update(user, {
                where: {id: producteur.user_id}
            });
        }
        console.log('id-----');
        console.log(p);
        console.log(id);
        console.log('id-----');
        await Producteur.update(p, {
            where: {id: id}
        }).then(num => {
            res.redirect('/admin/producteurs');
        }).catch(err => {
            console.log(err);
        });

    } catch (e) {
        //res.redirect('/admin/producteurs');
        console.log(e);
    }

    res.redirect('/admin/producteurs');
}

exports.delete = async (req, res) => {
    const id = req.params.id;

    const producteur = await Producteur.findOne({where: {id: id}});
    console.log(producteur);

    const user_id = producteur.user_id;

    if (producteur) {
        try {
            fs.unlinkSync(__dirname+`/../../../public/uploads/producteur/${producteur.id}/${producteur.img}`);
            fs.unlinkSync(__dirname+`/../../../public/uploads/producteur/${producteur.id}/${producteur.logo}`);
            fs.unlinkSync(__dirname+`/../../../public/uploads/producteur/${producteur.id}/img/300x300/${producteur.img}`);
            fs.unlinkSync(__dirname+`/../../../public/uploads/producteur/${producteur.id}/logo/300x300/${producteur.logo}`);
        } catch (err) {
            console.error(err)
        }
    }

    await Producteur.destroy({
        where: {id: id}
    })
        .then(num => {
            User.destroy({where: {id: user_id}});

            res.redirect('/admin/producteurs');

        })
        .catch(err => {
            res.redirect('/admin/producteurs');
        });
};


exports.passwordReset = async (req, res) => {

    let producteur = {};
    let error = {status: false, message: ''};


    if (req.query.id != undefined) {
        const id = req.query.id;

        producteur = await Producteur.findOne({where: {id: id}});
        console.log(producteur);
    }

    if (req.body.id != undefined) {

        let error = {status: false, message: ''};
        let id = req.body.id;
        let bcypt_password = await bcrypt.hash(req.body.password, 8);
        let repassword = req.body.repassword;

        if (req.body.password != repassword) {
            error.status = true;
            error.message = 'Mot de passe est different du confirmation';
        } else {
            const producteur = await Producteur.findOne({where: {id: id}});

            await User.update({password: bcypt_password}, {
                where: {id: producteur.user_id}
            })
                .then(num => {
                    res.redirect('/admin/producteurs');
                })
                .catch(err => {
                    res.status(500).send({
                        message: "Error updating Tutorial with id=" + id
                    });
                });
        }

    }

    res.render('admin/producteurs/password', {producteur: producteur, error: error});
};
