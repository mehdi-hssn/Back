const express = require("express"); // fast, open-source node.js server
const cors = require("cors"); // enables CORS (cross-origin resource sharing)
const bodyParser = require("body-parser"); // parses json body into javascript object
const morgan = require("morgan"); // log http requests
var cookieParser = require('cookie-parser');
const path = require("path");
const fileUpload = require('express-fileupload');
var session = require('express-session');
var cron = require('node-cron');
const app = express();
const { notFound, handleError } = require("./middlewares");
app.locals.moment = require('moment');

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());
app.use(session({
    key: process.env.SESSION_SID,
    secret: process.env.SESSION_SID_SECRET,
    name: process.env.SESSION_SID_NAME,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        expires: 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24,
    }
  })
);

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    
    if(req.session.userId == undefined){
        res.redirect('/login');
    }
    if (req.session.userId && req.cookies.user_sid) {

        if (req.session.roles == 'ROLE_ADMIN') {
            res.redirect('/admin');
        }

    } else {
        next();
    }
};

app.use(function (req, res, next) {
    // if(req.session.userId == undefined && ){
    //   res.redirect('/login');
    //   next();
    // }
    res.locals.first_name = req.session.first_name;
    res.locals.last_name = req.session.last_name;
    res.locals.user = req.session.user;
    res.locals.userId = req.session.userId;
    res.locals.roles = req.session.roles;
    next();
});

app.use('/', express.static(path.join(__dirname, './../public')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);

var corsOptions = {
    origin: process.env.CORS_ORIGIN
};

app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(bodyParser.json());

app.use(express.static('public'));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

const {db} = require("./models");
db.sequelize.sync();

app.use(fileUpload({createParentPath: true}));

app.get("/", sessionChecker,(req, res) => {
    res.redirect('/login');
});

// using routes web
require("./routes/api/producteursRoutes")(app);
require("./routes/api/productsRoutes")(app);
require("./routes/api/userRoutes")(app);


//usinf routes mobile



require("./routes/backend/admin/producteurs.routes")(app,sessionChecker);
require("./routes/backend/admin/dashboard.routes")(app,sessionChecker);
require("./routes/backend/security.routes")(app,sessionChecker);
require("./routes/backend/admin/produits.routes")(app,sessionChecker);

// handle errors
app.use(notFound); // in-case a url path is not found
app.use(handleError); // in-case an error has occured

const checkCommandeToValidate = require("./crons/checkCommandeToValidate");

cron.schedule('* */1 * * *', () => {

    checkCommandeToValidate.validateCommande();

    console.log('0 */1 * * *');
});

module.exports = app;