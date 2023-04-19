var util = require('util');
const fs = require('fs');
const axios = require('axios');

module.exports = {

    prepareObjectOrder: async function (panier){

    },
    createOrder: async function (panier) {

        let order = {
            "orderId": "orderID", //=> modification if orderId is specified "totalAmount": 4000, //amount control is done upon this total "currency": "eur",
            "desc": "LA COMMANDE DE LAHNA",
            "firstname": "Hassan",
            "lastname": "EL MANGOUG",
            "email": "hassan@paydone.fr",
            "shipping": {
                "address": "",
                "provider": {
                    "id": "shipping id",
                    "name": "shipping provider name (chrono, dpd, colissimo)",
                    "tracking": "trackingnimber ou url"
                },
                "name": "name of the shipping"
            },
            "partner":
                {
                    "id":
                        "ID du partenaire", "name":
                        "Partner name"
                }
            ,
            "customers":
                [
                    {
                        "email": "lahna@paydone.fr", //used as ID, updated if already existe
                        "adresse": "",
                        "firstname": "Lahna",
                        "lastname": "EL MANGOUG",
                        "phone": "0788534151",
                        "transactions": [
                            {
                                "amount": 4000,
                                "products": [{
                                    "id": "ID produit",
                                    "externalId": "identifiant externe eventuel", "price": 20000,
                                    "qty": 2,
                                    "taxRate": 20
                                }]
                            }]
                    }]
        };

        return order;

        // //paiement api paydone
        // await axios.post('http://api.paydone.fr/public/orders', {
        //     order: order,
        //     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im12ZSIsImZpcnN0YW5lbSI6IlRhbmd1eSIsImxhc3RuYW1lIjoiRG9yaW5lIiwicHNwS2V5IjoicGtfdGVzdF81MUhkMEhiSVZSNHZUTWQ5aUVpR1NGdkZpaG1VaDRydDVHZzEwbUJuVlowbmF4WUN6Q0ZqcUhrem8wakJCTm5STjNOMnhEaVk4bjJnRFpLekFLcHZBcGN0RDAwekYwb09MV2YiLCJyb2xlIjoiYXBpIiwiaWF0IjoxNjE3NjI2NDQwLCJleHAiOjE2MTc2NDA4NDB9.j_kHOTVhEp6xNZYZGVIOhMvl4zknq-jmQOe9HTlj3t8'
        // })
        //     .then((res) => {
        //         console.log(res);
        //     })
        //     .catch((error) => {
        //         // error.response.status Check status code
        //         console.log(error);
        //     }).finally(() => {
        //         //Perform action in always
        //     });



    },
    addClientToOrder: async function (panier) {

        let order = {
            "orderId": "orderID", //=> modification if orderId is specified "totalAmount": 4000, //amount control is done upon this total "currency": "eur",
            "desc": "LA COMMANDE DE LAHNA",
            "firstname": "Hassan",
            "lastname": "EL MANGOUG",
            "email": "hassan@paydone.fr",
            "shipping": {
                "address": "",
                "provider": {
                    "id": "shipping id",
                    "name": "shipping provider name (chrono, dpd, colissimo)",
                    "tracking": "trackingnimber ou url"
                },
                "name": "name of the shipping"
            },
            "partner":
                {
                    "id":
                        "ID du partenaire", "name":
                        "Partner name"
                }
            ,
            "customers":
                [
                    {
                        "email": "lahna@paydone.fr", //used as ID, updated if already existe
                        "adresse": "",
                        "firstname": "Lahna",
                        "lastname": "EL MANGOUG",
                        "phone": "0788534151",
                        "transactions": [
                            {
                                "amount": 4000,
                                "products": [{
                                    "id": "ID produit",
                                    "externalId": "identifiant externe eventuel", "price": 20000,
                                    "qty": 2,
                                    "taxRate": 20
                                }]
                            }]
                    }]
        };

        return order;

        // //paiement api paydone
        // await axios.post('http://api.paydone.fr/public/orders', {
        //     order: order,
        //     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im12ZSIsImZpcnN0YW5lbSI6IlRhbmd1eSIsImxhc3RuYW1lIjoiRG9yaW5lIiwicHNwS2V5IjoicGtfdGVzdF81MUhkMEhiSVZSNHZUTWQ5aUVpR1NGdkZpaG1VaDRydDVHZzEwbUJuVlowbmF4WUN6Q0ZqcUhrem8wakJCTm5STjNOMnhEaVk4bjJnRFpLekFLcHZBcGN0RDAwekYwb09MV2YiLCJyb2xlIjoiYXBpIiwiaWF0IjoxNjE3NjI2NDQwLCJleHAiOjE2MTc2NDA4NDB9.j_kHOTVhEp6xNZYZGVIOhMvl4zknq-jmQOe9HTlj3t8'
        // })
        //     .then((res) => {
        //         console.log(res);
        //     })
        //     .catch((error) => {
        //         // error.response.status Check status code
        //         console.log(error);
        //     }).finally(() => {
        //         //Perform action in always
        //     });



    },
    addProductToOrder: async function (panier) {

        let order = {
            "orderId": "orderID", //=> modification if orderId is specified "totalAmount": 4000, //amount control is done upon this total "currency": "eur",
            "desc": "LA COMMANDE DE LAHNA",
            "firstname": "Hassan",
            "lastname": "EL MANGOUG",
            "email": "hassan@paydone.fr",
            "shipping": {
                "address": "",
                "provider": {
                    "id": "shipping id",
                    "name": "shipping provider name (chrono, dpd, colissimo)",
                    "tracking": "trackingnimber ou url"
                },
                "name": "name of the shipping"
            },
            "partner":
                {
                    "id":
                        "ID du partenaire", "name":
                        "Partner name"
                }
            ,
            "customers":
                [
                    {
                        "email": "lahna@paydone.fr", //used as ID, updated if already existe
                        "adresse": "",
                        "firstname": "Lahna",
                        "lastname": "EL MANGOUG",
                        "phone": "0788534151",
                        "transactions": [
                            {
                                "amount": 4000,
                                "products": [{
                                    "id": "ID produit",
                                    "externalId": "identifiant externe eventuel", "price": 20000,
                                    "qty": 2,
                                    "taxRate": 20
                                }]
                            }]
                    }]
        };

        return order;

        // //paiement api paydone
        // await axios.post('http://api.paydone.fr/public/orders', {
        //     order: order,
        //     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im12ZSIsImZpcnN0YW5lbSI6IlRhbmd1eSIsImxhc3RuYW1lIjoiRG9yaW5lIiwicHNwS2V5IjoicGtfdGVzdF81MUhkMEhiSVZSNHZUTWQ5aUVpR1NGdkZpaG1VaDRydDVHZzEwbUJuVlowbmF4WUN6Q0ZqcUhrem8wakJCTm5STjNOMnhEaVk4bjJnRFpLekFLcHZBcGN0RDAwekYwb09MV2YiLCJyb2xlIjoiYXBpIiwiaWF0IjoxNjE3NjI2NDQwLCJleHAiOjE2MTc2NDA4NDB9.j_kHOTVhEp6xNZYZGVIOhMvl4zknq-jmQOe9HTlj3t8'
        // })
        //     .then((res) => {
        //         console.log(res);
        //     })
        //     .catch((error) => {
        //         // error.response.status Check status code
        //         console.log(error);
        //     }).finally(() => {
        //         //Perform action in always
        //     });



    },

};
