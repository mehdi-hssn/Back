const {db,cnx} = require("./../models");
var util = require('util');
const query = util.promisify(cnx.query).bind(cnx);
const Notification = db.notification;
const NotificationMobile = db.notification_mobile;
const Producteur = db.producteur;
const Produit = db.produit;
const Epicier = db.epicier;
const User = db.user;
const Op = db.Sequelize.Op;
const fs = require('fs');
const {QueryTypes} = require('sequelize');
const nodemailer = require("nodemailer");
const transporter = require('./../config/mail.config');
let tr = transporter.init();
const params = require('./../config/params.config');
const axios = require("axios");

module.exports = {
    /* validateCommande: async function () {

        let c = await db.sequelize.query(
            "SELECT cg.*,ce.*,cg.id as cg_id,ca.*,p.id as producteur_id,cg.ref as ref_globale FROM commande_globale cg inner join commande_expedition ce ON cg.id = ce.commande_id inner join producteur p ON ce.producteur_id = p.id inner join commande_adresselivraison ca ON cg.id = ca.commande_id WHERE cg.statut = :statut and ce.date_fermeture < CURDATE()",
            {
                replacements: {statut: '2'},
                type: QueryTypes.SELECT
            }
        );

        for (var i = 0; i < c.length; i++) {

            try {

            let total = 0;
            let commande = await db.sequelize.query(
                'SELECT c.id as commande_id,c.*,u.* FROM commande c inner join user u ON c.user_id = u.id WHERE c.statut = 1 and c.commande_globale_id = $1',
                {
                    bind: [c[i].cg_id],
                    type: QueryTypes.SELECT
                }
            );

            let producteur_data = await db.sequelize.query(
                'SELECT p.*,u.* from producteur p inner join user u ON p.user_id = u.id WHERE p.id = $1',
                {
                    bind: [c[i].producteur_id],
                    type: QueryTypes.SELECT
                }
            );

            if(producteur_data.length == 0){
                continue;
            }

            let expedition = 0;
            for (let j = 0; j < commande.length; j++) {

                let produit = await db.sequelize.query(
                    'SELECT cp.* FROM commande_produit cp WHERE cp.commande_id = $1',
                    {
                        bind: [commande[j].commande_id],
                        type: QueryTypes.SELECT
                    }
                );

                for (let ij = 0; ij < produit.length; ij++) {

                    if(c[i].unite == 'kg/l') {
                        if (produit[ij].type_poids == 'kg' || produit[ij].type_poids == 'l') {
                            expedition = expedition + (produit[ij].qte * produit[ij].poids_brut * produit[ij].conditionnee_par);
                        } else {
                            expedition = expedition + (produit[ij].conditionnee_par * produit[ij].qte * (produit[ij].poids_brut / 1000));
                        }
                    }

                    if(c[i].unite == 'euro') {
                        expedition = expedition + commande[j].total;
                    }

                    if(c[i].unite == 'col') {
                        expedition = expedition + (produit[ij].qte * produit[ij].poids_brut * produit[ij].conditionnee_par);
                    }

                }

            }

            if (expedition >= c[i].poids) {

                let statut = {
                    statut: 3,
                    statut_detail: 'EN_COURS_PRODUCTEUR',
                };

                for (let j = 0; j < commande.length; j++) {

                    NotificationMobile.create({
                        title: 'Commande N°'+commande[j].ref+' envoyée au producteur',
                        content: 'Bien Bien Bien !! On est sur une belle lancée, ta N°'+commande[j].ref+' commande vient d’être envoyée à notre producteur. Un peu de patience il va bientôt la valider !',
                        user_id: commande[j].user_id,
                        read: false,
                        code: 'COMMANDE_TO_PRODUCTEUR'
                    });
        
                        user_token = await query('SELECT ut.token from user_token ut WHERE ut.user_id = ?', [commande[j].user_id]);
                    
                        for(var ii=0;ii < user_token.length;ii++) {
                            if(user_token[ii] != undefined && user_token[ii]['token'] != undefined) {
                                
                                var messages = {
                                    to: user_token[ii]['token'], 
                                    notification: {
                                        title: 'Commande envoyée au producteur', 
                                    },
                                    data: {
                                        title: 'Commande envoyée au producteur', 
                                        body: 'Bien Bien Bien !! On est sur une belle lancée, ta N°'+commande[j].ref+' commande vient d’être envoyée à notre producteur. Un peu de patience il va bientôt la valider !',
                                        action: 'COMMANDE_TO_PRODUCTEUR',
                                    }
                                }
            
                                try {
                                    fcm.send(messages, function(err, response) {
                                        if (err) {
                                            // console.log("Something has gone wrong!")
                                            // console.log(err)
                                        } else {
                                            // console.log("Successfully sent with response: ", response)
                                            // console.log(response.results[0].error)
                                        }
                                    })
                                } catch(e) {
                                    //console.log(e);
                                }
                                
                            }
                        }

                }

                await CommandeGlobale.update(statut, {
                    where: {id: c[i].cg_id}
                }).then(num => {

                    for (let j = 0; j < commande.length; j++) {
                        Notification.create({
                            title: 'Commande N° '+commande[j].ref+' envoyée à notre producteur',
                            content: 'Bien Bien Bien !! On est sur une belle lancée, ta commande N° '+commande[j].ref+' vient d’être envoyée à notre producteur. Un peu de patience il va bientôt la valider !',
                            user_id: commande[j].user_id,
                            read: false,
                        });
                    }


                    Notification.create({
                        title: 'Nouvelle Commande N° '+c[i].ref,
                        content: 'Bonjour cher producteur, une nouvelle commande N° '+c[i].ref+' vient de tomber. Va vite jeter un oeil pour la valider et l’expédier.',
                        user_id: producteur_data[0].user_id,
                        read: false,
                        type: 'producteur',
                    });

                    let imgs = [
                        {
                            filename: 'brd1.jpg',
                            path: params.backend_url + "/assets/mails/create-commande/brd1.jpg",
                            cid: 'unique@brd1.jpg',
                            contentType: 'image/jpg'
                        }, {
                            filename: 'logo.jpg',
                            path: params.backend_url + "/assets/mails/create-commande/logo.jpg",
                            cid: 'unique@logo.jpg',
                            contentType: 'image/jpg'
                        }, {
                            filename: 'brd2.jpg',
                            path: params.backend_url + "/assets/mails/create-commande/brd2.jpg",
                            cid: 'unique@brd2.jpg',
                            contentType: 'image/jpg'
                        }, {
                            filename: 'icon.jpg',
                            path: params.backend_url + "/assets/mails/create-commande/icon.jpg",
                            cid: 'unique@icon.jpg',
                            contentType: 'image/jpg'
                        }
                    ];


                    // send mail with defined transport object
                    tr.sendMail({
                        from: process.env.SMTP_FROM ||
                        "'Mon Voisin L'Epicier' <contact@mon-voisin-epicier.fr>", // sender address
                        to: producteur_data[0].email,
                        subject: "Nouvelle commande N° "+c[i].ref,
                        text: "Nouvelle commande N° "+c[i].ref,
                        attachments: imgs,
                        html: "\n" +
                            "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">\n" +
                            "<html>\n" +
                            "<head>\n" +
                            "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
                            "<title></title>\n" +
                            "<style type=\"text/css\">\n" +
                            "* {\n" +
                            "\t-webkit-text-size-adjust: 100%;\n" +
                            "\t-ms-text-size-adjust: 100%;\n" +
                            "}\n" +
                            "body {\n" +
                            "\twidth: 100%;\n" +
                            "\tmargin: 0px;\n" +
                            "\tpadding: 0px;\n" +
                            "}\n" +
                            "img {\n" +
                            "\toutline: none;\n" +
                            "\ttext-decoration: none;\n" +
                            "\t-ms-interpolation-mode: bicubic;\n" +
                            "}\n" +
                            "a img {\n" +
                            "\tborder: none;\n" +
                            "}\n" +
                            "@media only screen and (max-width:640px) {\n" +
                            ".w320 {\n" +
                            "\twidth: 320px !important;\n" +
                            "}\n" +
                            ".w291 {\n" +
                            "\twidth: 291px !important;\n" +
                            "}\n" +
                            ".db {\n" +
                            "\tdisplay: block !important;\n" +
                            "}\n" +
                            ".dn {\n" +
                            "\tdisplay: none !important;\n" +
                            "}\n" +
                            ".w83{width:83px !important}\n" +
                            ".w125{width:125px !important}\n" +
                            ".h20{height:20px !important}\n" +
                            ".h40{height:40px !important}\n" +
                            "}\n" +
                            "</style>\n" +
                            "</head>\n" +
                            "\n" +
                            "<body>\n" +
                            "<table width=\"600\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" class=\"w320\">\n" +
                            "  <tr>\n" +
                            "    <td align=\"center\"><table width=\"562\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" class=\"w291\" style=\"width:562px\">\n" +
                            "     \n" +
                            "      <tr>\n" +
                            "        <td height=\"12\" style=\"font-size:0px;line-height:0px\"></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td align=\"center\"><table width=\"562\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" class=\"w291\" style=\"width:562px\">\n" +
                            "          <tr>\n" +
                            "            <td width=\"211\" style=\"width:211px\" class=\"w83\"><img src=\"cid:unique@brd1.jpg\" width=\"211\" style=\"display:block\" border=\"0\" class=\"w83\"></td>\n" +
                            "            <td align=\"center\" ><a href=\"#\" target=\"_blank\"><img src=\"cid:unique@logo.jpg\" width=\"139\"  style=\"display:block\" border=\"0\" class=\"w125\"></a></td>\n" +
                            "            <td width=\"212\" style=\"width:212px\" class=\"w83\"><img src=\"cid:unique@brd2.jpg\" width=\"212\" style=\"display:block\" border=\"0\" class=\"w83\"></td>\n" +
                            "          </tr>\n" +
                            "        </table></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td height=\"28\"  ></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td align=\"left\"   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:24px;line-height:32px;color:#4F5A68;\" >Bonjour "+producteur_data[0].last_name+"<img src=\"cid:unique@icon.jpg\" width=\"26\" height=\"27\"></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td height=\"12\" style=\"font-size:0px;line-height:0px\"></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td align=\"left\"   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:24px;line-height:32px;color:#4F5A68;\">Bonjour cher producteur, une nouvelle commande N° "+c[i].ref+" vient de tomber. Va vite jeter un oeil pour la valider et l’expédier.</td>"+
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td height=\"12\" style=\"font-size:0px;line-height:0px\"></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td height=\"12\" style=\"font-size:0px;line-height:0px\"></td>\n" +
                            "      </tr>\n" +
                            "       <tr>\n" +
                            "        <td height=\"59\"  ></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td align=\"left\"   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:10px;line-height:16px;color:#4F5A68;\" >ce courriel vous a été envoyé en tant que membre enregistré de <a href=\"#\" target=\"_blank\" style=\"text-decoration:none;color:#4F5A68\">monvoisinlepicier.fr</a>. pour mettre à jour vos préférences en matiére de courrier éléctronique, <a href=\"#\" target=\"_blank\" style=\"text-decoration:none;color:#0052e2\">cliquer ici.</a><br>\n" +
                            "          <br>\n" +
                            "          l'utilisation du service et du site web est soumise à nos <span style=\"color:#0052e2\">conditions d'utilisation</span> et à notre <span style=\"color:#0052e2\">déclaration de confidentialité</span>.<br>\n" +
                            "          <br>\n" +
                            "          © "+(new Date().getFullYear())+" mon voisin L'Épicier. Tous droits réservés</td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td height=\"100\" class=\"h40\"></td>\n" +
                            "      </tr>\n" +
                            "    </table></td>\n" +
                            "  </tr>\n" +
                            "</table>\n" +
                            "</body>\n" +
                            "</html>\n"

                    });

                }).catch(err => {
                    
                });


            } else {


                for (let j = 0; j < commande.length; j++) {


                    Notification.create({
                        title: 'Commande N° '+commande[j].ref+' : Seuil minimum de commande globale non atteint',
                        content: 'ta commande N° '+commande[j].ref+' a dû être annulée à cause : Seuil minimum de commande globale non atteint',
                        user_id: commande[j].user_id,
                        read: false,
                    });

                    NotificationMobile.create({
                        title: 'Commande N° '+commande[j].ref+' : Seuil minimum de commande globale non atteint',
                        content: 'ta commande N° '+commande[j].ref+' a dû être annulée à cause : Seuil minimum de commande globale non atteint',
                        user_id: commande[j].user_id,
                        read: false,
                        code: 'COMMANDE_TO_PRODUCTEUR'
                    });
        
                        user_token = await query('SELECT ut.token from user_token ut WHERE ut.user_id = ?', [commande[j].user_id]);
                    
                        for(var ii=0;ii < user_token.length;ii++) {
                            if(user_token[ii] != undefined && user_token[ii]['token'] != undefined) {
                                console.log(user_token[ii]);
                                var messages = {
                                    to: user_token[ii]['token'], 
                                    notification: {
                                        title: 'Commande N° '+commande[j].ref+' : Seuil minimum de commande globale non atteint', 
                                    },
                                    data: {
                                        title: 'Commande N° '+commande[j].ref+' : Seuil minimum de commande globale non atteint', 
                                        body: 'ta commande N° '+commande[j].ref+' a dû être annulée à cause : Seuil minimum de commande globale non atteint',
                                        action: 'COMMANDE_TO_PRODUCTEUR_CANCEL',
                                    }
                                }
                        
                                try {
                                    fcm.send(messages, function(err, response) {
                                        if (err) {
                                            console.log("Something has gone wrong!")
                                            console.log(err)
                                        } else {
                                            console.log("Successfully sent with response: ", response)
                                            console.log(response.results[0].error)
                                        }
                                    })
                                } catch(e) {
                                    console.log(e);
                                }
                                
                            }
                        }


                    let imgs = [
                        {
                            filename: 'brd1.jpg',
                            path: params.backend_url + "/assets/mails/create-commande/brd1.jpg",
                            cid: 'unique@brd1.jpg',
                            contentType: 'image/jpg'
                        }, {
                            filename: 'logo.jpg',
                            path: params.backend_url + "/assets/mails/create-commande/logo.jpg",
                            cid: 'unique@logo.jpg',
                            contentType: 'image/jpg'
                        }, {
                            filename: 'brd2.jpg',
                            path: params.backend_url + "/assets/mails/create-commande/brd2.jpg",
                            cid: 'unique@brd2.jpg',
                            contentType: 'image/jpg'
                        }, {
                            filename: 'icon.jpg',
                            path: params.backend_url + "/assets/mails/create-commande/icon.jpg",
                            cid: 'unique@icon.jpg',
                            contentType: 'image/jpg'
                        }
                    ];


                    // send mail with defined transport object
                    await tr.sendMail({
                        from: process.env.SMTP_FROM ||
                        "'Mon Voisin L'Epicier' <contact@mon-voisin-epicier.fr>", // sender address
                        to: commande[j].email,
                        subject: "Seuil minimum de commande globale non atteint",
                        text: "Seuil minimum de commande globale non atteint",
                        attachments: imgs,
                        html: "\n" +
                            "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">\n" +
                            "<html>\n" +
                            "<head>\n" +
                            "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
                            "<title></title>\n" +
                            "<style type=\"text/css\">\n" +
                            "* {\n" +
                            "\t-webkit-text-size-adjust: 100%;\n" +
                            "\t-ms-text-size-adjust: 100%;\n" +
                            "}\n" +
                            "body {\n" +
                            "\twidth: 100%;\n" +
                            "\tmargin: 0px;\n" +
                            "\tpadding: 0px;\n" +
                            "}\n" +
                            "img {\n" +
                            "\toutline: none;\n" +
                            "\ttext-decoration: none;\n" +
                            "\t-ms-interpolation-mode: bicubic;\n" +
                            "}\n" +
                            "a img {\n" +
                            "\tborder: none;\n" +
                            "}\n" +
                            "@media only screen and (max-width:640px) {\n" +
                            ".w320 {\n" +
                            "\twidth: 320px !important;\n" +
                            "}\n" +
                            ".w291 {\n" +
                            "\twidth: 291px !important;\n" +
                            "}\n" +
                            ".db {\n" +
                            "\tdisplay: block !important;\n" +
                            "}\n" +
                            ".dn {\n" +
                            "\tdisplay: none !important;\n" +
                            "}\n" +
                            ".w83{width:83px !important}\n" +
                            ".w125{width:125px !important}\n" +
                            ".h20{height:20px !important}\n" +
                            ".h40{height:40px !important}\n" +
                            "}\n" +
                            "</style>\n" +
                            "</head>\n" +
                            "\n" +
                            "<body>\n" +
                            "<table width=\"600\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" class=\"w320\">\n" +
                            "  <tr>\n" +
                            "    <td align=\"center\"><table width=\"562\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" class=\"w291\" style=\"width:562px\">\n" +
                            "     \n" +
                            "      <tr>\n" +
                            "        <td height=\"12\" style=\"font-size:0px;line-height:0px\"></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td align=\"center\"><table width=\"562\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" class=\"w291\" style=\"width:562px\">\n" +
                            "          <tr>\n" +
                            "            <td width=\"211\" style=\"width:211px\" class=\"w83\"><img src=\"cid:unique@brd1.jpg\" width=\"211\" style=\"display:block\" border=\"0\" class=\"w83\"></td>\n" +
                            "            <td align=\"center\" ><a href=\"#\" target=\"_blank\"><img src=\"cid:unique@logo.jpg\" width=\"139\"  style=\"display:block\" border=\"0\" class=\"w125\"></a></td>\n" +
                            "            <td width=\"212\" style=\"width:212px\" class=\"w83\"><img src=\"cid:unique@brd2.jpg\" width=\"212\" style=\"display:block\" border=\"0\" class=\"w83\"></td>\n" +
                            "          </tr>\n" +
                            "        </table></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td height=\"28\"  ></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td align=\"left\"   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:24px;line-height:32px;color:#4F5A68;\" >" + commande[j].first_name + " " + commande[j].last_name + " " + commande[j].first_name + " " + commande[j].last_name + " ... &nbsp;&nbsp;<img src=\"cid:unique@icon.jpg\" width=\"26\" height=\"27\"></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td height=\"12\" style=\"font-size:0px;line-height:0px\"></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td align=\"left\"   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:24px;line-height:32px;color:#4F5A68;\" >Nous avons l'immense tristesse de t’annoncer que ta commande N°" + commande[j].ref + " passée chez " + c[i].name + " a dû être annulée à cause : </td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td height=\"12\" style=\"font-size:0px;line-height:0px\"></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td align=\"left\"   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:24px;line-height:32px;color:#4F5A68;\" ><strong>Seuil minimum de commande globale non atteint</strong></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td height=\"12\" style=\"font-size:0px;line-height:0px\"></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td align=\"left\"   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:24px;line-height:32px;color:#4F5A68;\" >MAIS ! Une mauvaise nouvelle se suit toujours d’une bonne. Comme nous sommes des personnes bienveillantes, nous avons gardé ton panier pour que tu puisses relancer cette commande. T’inquiète on t’aidera pour arriver à tes fins.<br><br>" +
                            "NE RESTE PAS SUR UN ECHEC </td>\n" +
                            "      </tr>\n" +
                            "     \n" +
                            "      \n" +
                            "      \n" +
                            "       <tr>\n" +
                            "        <td height=\"59\"  ></td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td align=\"left\"   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:10px;line-height:16px;color:#4F5A68;\" >ce courriel vous a été envoyé en tant que membre enregistré de <a href=\"#\" target=\"_blank\" style=\"text-decoration:none;color:#4F5A68\">monvoisinlepicier.fr</a>. pour mettre à jour vos préférences en matiére de courrier éléctronique, <a href=\"#\" target=\"_blank\" style=\"text-decoration:none;color:#0052e2\">cliquer ici.</a><br>\n" +
                            "          <br>\n" +
                            "          l'utilisation du service et du site web est soumise à nos <span style=\"color:#0052e2\">conditions d'utilisation</span> et à notre <span style=\"color:#0052e2\">déclaration de confidentialité</span>.<br>\n" +
                            "          <br>\n" +
                            "          © "+(new Date().getFullYear())+" mon voisin L'Épicier. Tous droits réservés</td>\n" +
                            "      </tr>\n" +
                            "      <tr>\n" +
                            "        <td height=\"100\" class=\"h40\"></td>\n" +
                            "      </tr>\n" +
                            "    </table></td>\n" +
                            "  </tr>\n" +
                            "</table>\n" +
                            "</body>\n" +
                            "</html>\n"
                    });

                }

                let statut = {
                    statut: 0,
                    statut_detail: 'ANNULER',
                };
                await CommandeGlobale.update(statut, {
                    where: {id: c[i].cg_id}
                }).then(num => {
                    console.log(num);
                }).catch(err => {
                    
                });

            }
        
        } catch (e) {

        }

        }

        return;

    } */
};
