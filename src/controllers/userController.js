//const { userService } = require("../services");
var util = require('util');
const {cnx} = require("./../models");
const query = util.promisify(cnx.query).bind(cnx);
const jwt = require("jsonwebtoken");
const transporter = require('./../config/mail.config');
let tr = transporter.init();
const bcrypt = require("bcrypt");
const params = require('./../config/params.config');

module.exports = {

    // GET /api/users
    find: async function (req, res, next) {
        try {

            const user = await query('SELECT id,last_name, first_name, email, token, confirmation, roles, user_img, phone, region_id, departement_id, ville_id FROM user', []);
            res.json(user);
        } catch (error) {
            error.message = "failed to create resource";
            next(error);
        }
    },

    // GET /api/users/:id
    findOne: async function (req, res, next) {
        try {

            let user_id = req.param('id');
            const user = await query('SELECT id,last_name, first_name, email, token, confirmation, roles, user_img, phone, region_id, departement_id, ville_id FROM user WHERE id = ?', [user_id]);
            res.json(user);

        } catch (error) {
            error.message = "failed to create resource";
            next(error);
        }
    },


    findByEmail: async function (req, res, next) {
        try {
            let email = req.param('email');
            let results = await query('SELECT id,last_name, first_name, email, token, confirmation, roles, user_img, phone, region_id, departement_id, ville_id FROM user WHERE email = ?', [email]);
            res.json(results);
        } catch (error) {
            error.message = "failed to create resource";
            next(error);
        }
    },

    register: async function (req, res, next) {

        let errors = {status: true, message: '', block: false};
        let join = req.param('join');
        let epicerie_id = req.param('epicerie_id');
        let ref = req.param('ref');
        let last_name = req.param('last_name');
        let first_name = req.param('first_name');
        let email = req.param('email');
        let password = req.param('password');


        let roles = '["ROLE_CLIENT"]';
        let bcypt_password = await bcrypt.hash(password, 8);
        const token = jwt.sign({last_name: last_name, first_name: first_name, email: email},
            "mve");


        let link = params.frontend_url+'/api/user/confirmation/' + token;
        if (join == 1) {
            link = params.frontend_url+'/commande/join/' + ref + '?token=' + token;
        }

        if (join == 2) {
            link = params.frontend_url+'/epicerie/membre/rejoindre/' + epicerie_id + '?token=' + token;

        }

        let results = await query('SELECT * FROM user where JSON_CONTAINS(roles, ?) AND email = ? limit 1', [roles, email]);

        if (results.length > 0) {
            errors.status = false;
            errors.message = 'Utilisateur existe déja';
            res.json(errors);
            return;
        } else {

            results = await query('insert into user (last_name,first_name,email,password,actif,token,confirmation,roles,date_creation) values (?,?,?,?,?,?,?,?,?)', [
                last_name,
                first_name,
                email,
                bcypt_password,
                1,
                token,
                token,
                roles,
                new Date(),
            ]);

        }
        res.json(errors);

    },

    registerGoogle: async function (req, res, next) {

        let last_name = req.param('last_name');
        let first_name = req.param('first_name');
        let email = req.param('email');
        let password = req.param('email');
        let roles = req.param('roles');
        let bcypt_password = await bcrypt.hash(password, 8);
        const token = jwt.sign({last_name: last_name, email: email},
            "secret");

        let results = await query('SELECT * FROM user where roles = "ROLE_EPICIER" AND email = ? limit 1', email);

        if (results.length == 0) {

            results = await query('insert into user (last_name,first_name,email,password,actif,token,confirmation,roles) values (?,?,?,?,?,?,?)', [
                last_name,
                first_name,
                email,
                bcypt_password,
                1,
                token,
                token,
                roles,
            ]);



            if (results) {
                results = await query('SELECT * FROM user where id = ? limit 1', results.insertId);

                // // create reusable transporter object using the default SMTP transport
                // let transporter = nodemailer.createTransport({
                //     host: "smtp-relay.sendinblue.com",
                //     port: 587,
                //     secure: false, // true for 465, false for other ports
                //     auth: {
                //         user: 'ismail.boutouba@e-i.ma', // generated ethereal user
                //         pass: 'pzvUPI1MGON9yV23', // generated ethereal password
                //     },
                // });
                //
                // console.log(email);
                //
                // // send mail with defined transport object
                // let info = transporter.sendMail({
                //     from: '"boutouba 👻" <ismail.boutouba@e-i.ma>', // sender address
                //     to: email, // list of receivers
                //     subject: "Inscription mon voisin epicier", // Subject line
                //     text: "Merci pour votre inscription", // plain text body
                //     html: "<b>Merci pour votre inscription<br><a href='http://localhost:8080/api/user/confirmation/"+token+"'>veuillez clique ici pour activer votre compte</a></b>", // html body
                // });
                //
                // console.log("Message sent: %s", info.messageId);
                // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                //
                // // Preview only available when sending through an Ethereal account
                // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

                res.json(results);
                next();
            }

        }
        res.json(results);
        next();

    }
    ,
    registerFacebook: async function (req, res, next) {

        let last_name = req.param('last_name');
        let email = req.param('email');
        let password = req.param('email');
        let roles = req.param('roles');

        let bcypt_password = await bcrypt.hash(password, 8);
        const token = jwt.sign({last_name: last_name, email: email},
            "secret");


        let results = await query('SELECT * FROM user where roles = "ROLE_EPICIER" AND email = ? limit 1', email);

        if (results.length == 0) {

            results = await query('insert into user (last_name,first_name,email,password,actif,token,confirmation,roles) values (?,?,?,?,?,?,?,?)', [
                last_name,
                '',
                email,
                bcypt_password,
                1,
                token,
                token,
                roles,
            ]);

            if (results) {

                results = await query('SELECT * FROM user where id = ? limit 1', results.insertId);
                // // create reusable transporter object using the default SMTP transport
                // let transporter = nodemailer.createTransport({
                //     host: "smtp-relay.sendinblue.com",
                //     port: 587,
                //     secure: false, // true for 465, false for other ports
                //     auth: {
                //         user: 'ismail.boutouba@e-i.ma', // generated ethereal user
                //         pass: 'pzvUPI1MGON9yV23', // generated ethereal password
                //     },
                // });
                //
                // console.log(email);
                //
                // // send mail with defined transport object
                // let info = transporter.sendMail({
                //     from: '"boutouba 👻" <ismail.boutouba@e-i.ma>', // sender address
                //     to: email, // list of receivers
                //     subject: "Inscription mon voisin epicier", // Subject line
                //     text: "Merci pour votre inscription", // plain text body
                //     html: "<b>Merci pour votre inscription<br><a href='http://localhost:8080/api/user/confirmation/"+token+"'>veuillez clique ici pour activer votre compte</a></b>", // html body
                // });
                //
                // console.log("Message sent: %s", info.messageId);
                // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                //
                // // Preview only available when sending through an Ethereal account
                // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

                res.json(results);
                next();
            }

        }
        res.json(results);
        next();

    }
    ,
    login: async function (req, res, next) {

        let email = req.body[0].email;
        let password = req.body[0].password;
        let roles = '["ROLE_CLIENT"]';

        let error = {error: ''};

        let r = await query('SELECT * FROM user where email = ?', [email]);

        if (r.length == 0) {
            error.error = 'Utilisateur non trouvé';
            return res.send(error);
        }

        r = await query('SELECT * FROM user where actif = ? and email = ?', [1, email]);

        if (r.length == 0) {
            error.error = 'Vous n\'avez pas activé votre compte.';
            res.json(error);
        }

        r = await query('SELECT * FROM user where JSON_CONTAINS(roles,?) AND email = ?', [roles, email]);

        if (r.length == 0) {
            error.error = 'Vous n\'avez pas la permission.';
            res.json(error);
        }

        const isPasswordMatch = await bcrypt.compare(password, r[0].password);
        if (!isPasswordMatch) {
            error.error = 'Mot de passe incorrect';
            res.json(error);
        }
        if (error.error == '') {

            // // Create token
            // const token_valid = jwt.sign(
            //     { user_id: user._id, email },
            //     process.env.TOKEN_KEY,
            //     {
            //         expiresIn: "2h",
            //     }
            // );
            // // save user token
            // user.token = token;


            res.json(r);
        }

    }

    , sendMailForgotPassword: async function (req, res, next) {

        let email = req.param('email');
        let roles = '["ROLE_CLIENT"]';
        let r = await query('SELECT * FROM user where JSON_CONTAINS(roles,?) AND email = ?',[roles,  email]);

        if (!r) {
            res.json({email: email, status: false});
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
            },{
                filename: 'brd3.jpg',
                path: params.backend_url + "/assets/mails/create-commande/brd3.jpg",
                cid: 'unique@brd3.jpg',
                contentType: 'image/jpg'
            }, {
                filename: 'icon.jpg',
                path: params.backend_url + "/assets/mails/create-commande/icon.jpg",
                cid: 'unique@icon.jpg',
                contentType: 'image/jpg'
            }
        ];


        console.log(params.frontend_url);

        let info = await tr.sendMail({
          from: process.env.SMTP_FROM ||
            "'Mon Voisin L'Epicier' <contact@mon-voisin-epicier.fr>", // sender address
          to: email, // list of receivers
          subject: "Mot de passe oublié", // Subject line
          text: "Mot de passe oublié", // plain text body
          attachments: imgs,
          html:
            '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">\n' +
            "<html>\n" +
            "<head>\n" +
            '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n' +
            "<title>Mot de passe oublier</title>\n" +
            '<style type="text/css">\n' +
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
            '<table width="600" border="0" align="center" cellpadding="0" cellspacing="0" class="w320">\n' +
            "  <tr>\n" +
            '    <td align="center"><table width="562" border="0" align="center" cellpadding="0" cellspacing="0" class="w291" style="width:562px">\n' +
            "     \n" +
            "      <tr>\n" +
            '        <td height="12" style="font-size:0px;line-height:0px"></td>\n' +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td align="center"><table width="562" border="0" align="center" cellpadding="0" cellspacing="0" class="w291" style="width:562px">\n' +
            "          <tr>\n" +
            '            <td width="211" style="width:211px" class="w83"><img src="cid:unique@brd1.jpg" width="211" style="display:block" border="0" class="w83"></td>\n' +
            '            <td align="center" ><a href="#" target="_blank"><img src="cid:unique@logo.jpg" width="139"  style="display:block" border="0" class="w125"></a></td>\n' +
            '            <td width="212" style="width:212px" class="w83"><img src="cid:unique@brd2.jpg" width="212" style="display:block" border="0" class="w83"></td>\n' +
            "          </tr>\n" +
            "        </table></td>\n" +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td height="28"  ></td>\n' +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td   valign="middle" style="font-family:Arial,Trebuchet MS,  sans-serif ; font-size:24px;line-height:32px;color:#4F5A68;" >Salut à toi petit génie, &nbsp;&nbsp;<img src="cid:unique@icon.jpg" width="26" height="27"></td>\n' +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td height="12" style="font-size:0px;line-height:0px"></td>\n' +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td   valign="middle" style="font-family:Arial,Trebuchet MS,  sans-serif ; font-size:24px;line-height:32px;color:#4F5A68;" >On me dit à l’oreillette que tu as perdu ton mot de passe de ton compte Mon voisin l’Epicier. Ça passe pour cette fois, mais pas 2 !! </td>\n' +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td height="12" style="font-size:0px;line-height:0px"></td>\n' +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td height="30"  ></td>\n' +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td align="center"><table width="197" border="0" align="center" cellpadding="0" cellspacing="0">\n' +
            "  <tr>\n" +
            '    <td height="100" align="center"   valign="middle" bgcolor="#800000" style="font-family:Arial,Trebuchet MS,  sans-serif ; font-size:16px;line-height:30px;color:#ffffff;" ><a href="'+params.frontend_url+'/api/user/reset/'+r[0].token+'" target="_blank" style="text-decoration:none;color:#ffffff;border-raduis:10px;"><strong>Veuillez cliquer sur ce lien pour changer le mot de passe</strong></a></td>\n' +
            "  </tr>\n" +
            "</table>\n" +
            "</td>\n" +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td height="30"  ></td>\n' +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td><img src="cid:unique@brd3.jpg" width="560" height="1" style="display:block" border="0" class="w291"></td>\n' +
            "      </tr>\n" +
            "      <tr>\n" +
            '        <td height="22" class="h40"></td>\n' +
            "      </tr>\n" +
            "<tr>\n" +
            '                    <td valign="middle"\n' +
            '                        style="font-family:Arial,Trebuchet MS,  sans-serif ; font-size:10px;line-height:16px;color:#4F5A68;">\n' +
            '                        si vous n\'avez pas demandé une réinitialisation de votre mot de passe. veuillez <a href="#"\n' +
            '                                                                                                           target="_blank"\n' +
            '                                                                                                           style="text-decoration:none;color:#0052e2">nous\n' +
            "                        contacter</a>.<br><br>\n" +
            "\n" +
            '                        ce courriel vou a été envoyé en tant que membre enregistré de <a href="#" target="_blank"\n' +
            '                                                                                         style="text-decoration:none;color:#4F5A68">monvoisinlepicier.fr</a>\n' +
            '                        pour mettre à jour vos préférences&nbsp;en matiére de courrier électronique , <a href="#"\n' +
            '                                                                                                         target="_blank"\n' +
            '                                                                                                         style="text-decoration:none;color:#0052e2">cliquez\n' +
            "                        ici</a>.<br>\n" +
            "                        <br>\n" +
            "                        l'utilisation du service et du site web est soumise à nos <span style=\"color:#0052e2\">conditions d'utilisation</span>\n" +
            '                        et à notre <span style="color:#0052e2">déclaration de confidentialité</span>.<br>\n' +
            "                        <br>\n" +
            "                        © " +
            new Date().getFullYear() +
            " mon voisin L'Épicier. Tous droits réservés\n" +
            "                    </td>\n" +
            "                </tr>" +
            "    </table></td>\n" +
            "  </tr>\n" +
            "</table>\n" +
            "</body>\n" +
            "</html>\n", // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        res.json({email: email, status: true});

    }

    ,
    confirmation: async function (req, res, next) {

        let token = req.param('token');

        let results = await query('UPDATE user set actif = 1 WHERE confirmation = ?', [
            token,
        ]);

        if (results.affectedRows > 0) {
            results = await query('SELECT * FROM user where token = ? limit 1', token);
        }

        res.json(results);

    }
    ,
    resetPassword: async function (req, res, next) {

        let password = req.param('password');
        let token = req.param('token');

        let bcypt_password = await bcrypt.hash(password, 8);

        let results = await query('UPDATE user set password = ? WHERE token = ?', [
            bcypt_password,
            token,
        ]);

        res.json(results);

    }
    ,
    // PUT /api/users/:id
    update: async function (req, res, next) {
        try {

            let last_name = req.body.data.last_name;
            let first_name = req.body.data.first_name;
            let email = req.body.data.email;
            let phone = req.body.data.phone;

            let user = await query('UPDATE user set last_name = ?,first_name = ?,email = ?,phone = ? WHERE id = ?', [
                last_name,
                first_name,
                email,
                phone,
                req.param('id'),
            ]);

            if (user == null) res.status(404).json("not found");
            else res.json(user);
        } catch (error) {
            error.message = "failed to update resource";
            next(error);
        }
    },
    updatePassword: async function (req, res, next) {
        try {
            let password = await bcrypt.hash(req.body.data.newpassword, 8);

            let user = await query('UPDATE user set password = ? WHERE id = ?', [
                password,
                req.param('id'),
            ]);

            if (user == null) res.status(404).json("not found");
            else res.json(user);
        } catch (error) {
            error.message = "failed to update resource";
            next(error);
        }
    },
    saveRegion: async function (req, res, next) {

        let region = req.param('region');
        let user_id = req.param('user_id');

        let results = await query('UPDATE user set region_id = ? WHERE id = ?', [
            region,
            user_id,
        ]);

        res.json(results);

    }

};
