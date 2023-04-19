
module.exports = {
    calculerLePrixHT: function (products,producteur) {

        let prix_transport = 0;

        if (products.conditionnee_par == null || products.conditionnee_par == 0 || products.conditionnee_par == '') {
            products.conditionnee_par = 1;
        }

        if (products.tva == null || products.tva == 0 || products.tva == '') {
            products.tva = 0;
        }
        let franco_port = 0;
        if(producteur.franco_port != undefined) {
            franco_port = producteur.franco_port;

        } else if(producteur.franco_de_port != undefined) {
            franco_port = producteur.franco_de_port;

        }

        if (franco_port == 1) {

            if (products.type_poids == 'kg' || products.type_poids == 'l') {
                prix_transport = prix_transport + (producteur.cout_transport_kg * (products.conditionnee_par * products.poids_brut));
            }

            if (products.type_poids == 'g' || products.type_poids == 'ml') {
                prix_transport = prix_transport + (producteur.cout_transport_kg * (products.conditionnee_par * (products.poids_brut / 1000)));
            }

        }

        let m = 1;
        if(products.tva == 20) {
            m = 1.224;
        }

        if(products.tva == 5.5) {
            m = 1.192;
        }

        var prix = ((products.prix * products.conditionnee_par) + prix_transport) * m;
        prix = prix + 0.25;
        prix = prix + ((prix * 1.14 )/ 100);

        return prix.toFixed(2);

    },
    calculerLePrix: function (products,producteur) {

        let prix_transport = 0;

        if (products.conditionnee_par == null || products.conditionnee_par == 0 || products.conditionnee_par == '') {
            products.conditionnee_par = 1;
        }

        if (products.tva == null || products.tva == 0 || products.tva == '') {
            products.tva = 0;
        }
        let franco_port = 0;
        if(producteur.franco_port != undefined) {
            franco_port = producteur.franco_port;

        } else if(producteur.franco_de_port != undefined) {
            franco_port = producteur.franco_de_port;

        }

        if (franco_port == 1) {

            if (products.type_poids == 'kg' || products.type_poids == 'l') {
                prix_transport = (producteur.cout_transport_kg * (products.conditionnee_par * products.poids_brut));
            }

            if (products.type_poids == 'g' || products.type_poids == 'ml') {
                prix_transport = (producteur.cout_transport_kg * (products.conditionnee_par * (products.poids_brut / 1000)));
            }

        }

        let m = 1;
        if(products.tva == 20) {
            m = 1.224;
        }

        if(products.tva == 5.5) {
            m = 1.192;
        }

        var prix = ((products.prix * products.conditionnee_par) + prix_transport) * m;
        prix =  prix + ((prix * products.tva) / 100);
        prix = prix + 0.25;
        prix = prix + ((prix * 1.14 )/ 100);


        return prix.toFixed(2);

    },

    calculerLePrixEpicurien: function (products,producteur) {

        let prix_transport = 0;

        if (products.conditionnee_par == null || products.conditionnee_par == 0 || products.conditionnee_par == '') {
            products.conditionnee_par = 1;
        }

        if (products.tva == null || products.tva == 0 || products.tva == '') {
            products.tva = 0;
        }
        let franco_port = 0;
        if(producteur.franco_port != undefined) {
            franco_port = producteur.franco_port;

        } else if(producteur.franco_de_port != undefined) {
            franco_port = producteur.franco_de_port;

        }

        if (franco_port == 1) {

            if (products.type_poids == 'kg' || products.type_poids == 'l') {
                prix_transport = (producteur.cout_transport_kg * (products.conditionnee_par * products.poids_brut));
            }

            if (products.type_poids == 'g' || products.type_poids == 'ml') {
                prix_transport = (producteur.cout_transport_kg * (products.conditionnee_par * (products.poids_brut / 1000)));
            }

        }

        let m = 1;
        if(products.tva == 20) {
            m = 1.224;
        }

        if(products.tva == 5.5) {
            m = 1.192;
        }

        var prix = ((products.prix * products.conditionnee_par) + prix_transport) * m;
        prix =  prix + ((prix * products.tva) / 100);
        prix = prix + 0.25;
        prix = prix + ((prix * 1.14 )/ 100);


        return prix.toFixed(2);

    },


}
