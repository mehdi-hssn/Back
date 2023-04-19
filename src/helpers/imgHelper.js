const fetch = require('node-fetch');
const fs = require('fs');
const params = require('./../config/params.config');

module.exports = {
    checkImage: async function (combined) {

        let img = [];
        for (var k_combined = 0; k_combined < combined.length; k_combined++) {

            await fetch(combined[k_combined].path, {method: 'HEAD'})
                .then(res => {
                    if (!res.ok) {
                        console.log('Image does not exist.');
                    } else {
                        img.push(combined[k_combined]);
                    }
                }).catch(err => console.log('Error:', err));

        }

        return img;
    },
    ImageExists: function ImageExists(url) {
        if (fs.existsSync('./public'+url)) {
            return true;
        }
        return false;
    }

}
