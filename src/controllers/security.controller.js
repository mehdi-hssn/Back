const {db} = require("../models");
const User = db.user;
const Producteur = db.producteur;
const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const params = require("./../config/params.config");
const transporter = require('./../config/mail.config');
let tr = transporter.init();

exports.registerProducteur = async (req, res) => {

    let error = {
        error: '',
        status: false
    };

    if (req.body.email != undefined) {

        let email = req.body.email;
        let password = req.body.password;
        let repassword = req.body.repassword;
        let nom = req.body.nom;

        let c = {
            email: email,
            last_name: nom,
            roles: '["ROLE_ADMIN"]',
            actif: 1
        };

        if (nom == '') {
            error.status = true;
            error.error = 'Nom obligatoire';
        } else if (email == '') {
            error.status = true;
            error.error = 'Email obligatoire';
        } else if (password == '') {
            error.status = true;
            error.error = 'Mot de passe obligatoire';
        } else if (password == '') {
            error.status = true;
            error.error = 'Confirmation du mot de passe obligatoire';
        } else if (password != repassword) {
            error.status = true;
            error.error = 'Confirmation du mot de passe et mot de passe incorrect';
        } else {

            let user = await User.findOne({
                where: {
                    email: email,
                    roles:{
                        [Op.like]: "%ROLE_ADMIN%"
                    }
                },
            });

            if (user) {
                error.status = true;
                error.error = 'Utilisateur existe déja essayer une autre adresse email.';
            } else {

                c.password = await bcrypt.hash(password, 8);
                c.token = jwt.sign({last_name: c.last_name, email: c.email},
                    "secret");

                c.confirmation = c.token;


                await User.create(c).then(function (data) {
                    error.status = true;
                    error.error = 'Compte créer.';

                    let id = data.id;
                    Producteur.create({
                        name: nom,
                        user_id: id,
                        actif: 1
                    });

                });

            }

        }

    }

    res.render('security/registerProducteur', {error: error});
};

exports.registerProducteurConfirmation = async (req, res) => {

    let error = {
        error: '',
        status: false
    };
    let token = req.params.token;

    if (token == null) {
        res.redirect('/login');
    }

    let user = await User.findOne({
        where: {
            token: token,
            roles:{
                [Op.like]: "%ROLE_PRODUCTEUR%"
            }
        }
    });

    let checkroles = user.roles != undefined ? user.roles.includes("ROLE_PRODUCTEUR") : false;

    if (checkroles) {

        await User.update({
            actif: 1
        }, {
            where: {
                token: token,
                roles:{
                    [Op.like]: "%ROLE_PRODUCTEUR%"
                }
            }
        }).then(function () {
            error.status = true;
            error.error = 'Compte activé,veuillez se connecter.';
        });

    } else {
        error.status = true;
        error.error = 'Utilisateur non trouvé.';
    }

    res.render('security/login', {error: error});

};

exports.login = async (req, res,next) => {

    let error = {
        error: '',
        status: false
    };
    if (req.body.email) {

        let email = req.body.email;
        let password = req.body.password;
        let user = await User.findOne({
            where: {
                email: email,
                [Op.or]: [{
                    roles: {

                        [Op.like]: "%ROLE_ADMIN%"

                    }}
                ]

            }
        });

        if (!user) {
            error.status = true;
            error.error = 'Utilisateur non trouvé';
        } else {

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                error.status = true;
                error.error = 'Mot de passe incorrect';
            } else if (user.actif == 0) {
                error.status = true;
                error.error = 'Votre compte n’est pas activé';
            } else if (isPasswordMatch) {

                if (user.roles.includes("ROLE_ADMIN") == false && user.roles.includes("ROLE_PRODUCTEUR") == false ) {
                    error.status = true;
                    error.error = 'Vous n\'avez pas la permission.';
                }

                if (user.roles.includes("ROLE_ADMIN")) {

                    req.session.first_name = user.first_name;
                    req.session.last_name = user.last_name;
                    req.session.userId = user.id;
                    req.session.email = user.email;
                    req.session.roles = user.roles;
                    res.redirect('/admin');
                    return;

                }
            }

        }

    }

    res.render('security/login', {error: error});
};

exports.resetPassword = async (req, res) => {

    let error = {
        error: '',
        status: false
    };

    if (req.body.email) {

        let email = req.body.email;
        let user = await User.findOne({
            where: {
                email: email,
                roles: {
                    [Op.like]: "%ROLE_PRODUCTEUR%"
                },
            }
        });

        if (user) {

            if (user.actif == 0) {
                error.error = "Votre compte n'est pas actif.";
                error.status = true;
            } else {

                error.error = "Un mail à été envoyer a ton boite email.";
                error.status = true;

                let token = user.token;

                if(user.token == null || user.token == ''){

                    token = await jwt.sign({last_name: user.last_name, email: user.email},
                        "secret");

                    await User.update({
                        token:token,
                        confirmation:token,
                    }, {
                        where: {
                            id: user.id,
                        }
                    }).then(function () {

                    });

                }

                let link = params.backend_url+'/register/producteur/password/' + token;

                // send mail with defined transport object
                let mail = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">\n" +
                "<html>\n" +
                "<head>\n" +
                "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
                "<title>Inscription</title>\n" +
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
                ".h20{height:20x !important}\n" +
                ".h40{height:40x !important}\n" +
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
                "        <td   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:24px;line-height:32px;color:#4F5A68;\" >Bonjour " + user.last_name + " &nbsp;&nbsp;<img src=\"cid:unique@icon.jpg\" width=\"26\" height=\"27\"></td>\n" +
                "      </tr>\n" +
                "      <tr>\n" +
                "        <td height=\"12\" style=\"font-size:0px;line-height:0px\"></td>\n" +
                "      </tr>\n" +
                "      <tr>\n" +
                "        <td   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:24px;line-height:32px;color:#4F5A68;\" >Bienvenue sur Mon Voisin L'Épicier ! Veuillez cliquer&nbsp;sur le bouton ci-dessous afin de réinitialiser votre mot de passe :</td>\n" +
                "      </tr>\n" +
                "      <tr>\n" +
                "        <td height=\"30\"  ></td>\n" +
                "      </tr>\n" +
                "      <tr>\n" +
                "        <td align=\"center\"><table width=\"307\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" class=\"w291\">\n" +
                "  <tr>\n" +
                "    <td height=\"56\" align=\"center\"  valign=\"middle\" bgcolor=\"#012294\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:16px;line-height:18px;color:#ffffff;\" ><strong><a href=\"" + link + "\" target=\"_blank\" style=\"text-decoration:none;color:#ffffff\">RÉINITIALISER</a></strong></td>\n" +
                "  </tr>\n" +
                "</table>\n" +
                "</td>\n" +
                "      </tr>\n" +
                "      <tr>\n" +
                "        <td height=\"30\"  ></td>\n" +
                "      </tr>\n" +
                "      <tr>\n" +
                "        <td   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:14px;line-height:20px;color:#4F5A68;\" ></td>\n" +
                "      </tr>\n" +
                "       <tr>\n" +
                "        <td height=\"30\"  ></td>\n" +
                "      </tr>\n" +
                "      <tr>\n" +
                "        <td   valign=\"middle\" style=\"font-family:Arial,Trebuchet MS,  sans-serif ; font-size:10px;line-height:16px;color:#4F5A68;\" >© 2021 mon voisin L'Épicier. Tous droits réservés</td>\n" +
                "      </tr>\n" +
                "      <tr>\n" +
                "        <td height=\"100\" class=\"h40\"></td>\n" +
                "      </tr>\n" +
                "    </table></td>\n" +
                "  </tr>\n" +
                "</table>\n" +
                "</body>\n" +
                "</html>\n";

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

                let info = tr.sendMail({
                    from: process.env.SMTP_FROM, // sender address
                    to: user.email, // list of receivers
                    subject: "Mot de passe oublié", // Subject line
                    text: "Mot de passe oublié", // plain text body
                    html: mail,
                    attachments: imgs
                }, function (error, success) {
                    if (error) {
                        console.log(error);
                    }

                });

            }

        }

    }

    res.render('security/reset_password', {error: error});
};

exports.setResetPassword = async (req, res) => {

    let error = {
        error: '',
        status: false
    };

    let token = req.params.token;

    if (token == null) {
        res.redirect('/login');
    }

    let user = await User.findOne({
        where: {
            token: token,
            roles: {
                [Op.like]: "%ROLE_PRODUCTEUR%"
            },
        }
    });

    if(user == false) {
        res.redirect('/login');
    }


    if (req.body.password != undefined) {

        if(req.body.password == ""){
            error.error = "Mot de passe obligatoire";
            error.status = true;

            res.render('security/set_reset_password', {error: error,user:user});
        }

        else if(req.body.repassword == ""){
            error.error = "Confirmation du Mot de passe obligatoire";
            error.status = true;


            res.render('security/set_reset_password', {error: error,user:user});
        }else {

            let id = req.body.id;
            let user = await User.findOne({
                where: {
                    id: id,
                    roles: {
                        [Op.like]: "%ROLE_PRODUCTEUR%"
                    },
                }
            });

            if (user != null) {

                if (user.actif == 0) {
                    error.error = "Votre compte n'est pas actif.";
                    error.status = true;
                } else {

                    if (req.body.password != req.body.repassword) {
                        error.status = true;
                        error.error = 'Mot de passe est different du confirmation';
                    }
                    if(req.body.password == req.body.repassword) {


                        let password = await bcrypt.hash(req.body.password, 8);

                        await User.update({password: password}, {
                            where: {id: id}
                        })
                            .then(num => {

                                error.status = true;
                                error.error = 'Mot de passe à été changer, veuillez se connecter.';

                                res.render('security/set_reset_password', {error: error,user:user});
                            })
                            .catch(err => {
                                res.status(500).send({
                                    message: "Error"
                                });
                            });
                    }


                }

            } else {
                error.error = "Aucun producteur trouvée";
                error.status = true;
            }


        }

    }

    res.render('security/set_reset_password', {error: error, user:user});
};

exports.logout = async (req, res) => {
    req.session.userId = null;
    req.session.email = null;
    req.session.roles = null;
    res.redirect('/login');
};

