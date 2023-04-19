// Resize.js
const sharp = require('sharp');
var uuid = require('uuid');
const path = require('path');
const fs = require('fs');

class Resize {
    constructor(folder,width,height) {
        this.folder = folder;
        this.width = width;
        this.height = height;
    }
    async save(buffer,filename) {

        //const img = fs.readFileSync(buffer, {encoding: 'base64'});

        //const filenames = Resize.filename();
        const filepath = this.filepath(filename);

        await sharp(buffer)
            .resize(this.width,this.height,{
                //quality: 100,
                fit: sharp.fit.fill,
                withoutEnlargement: false,
                //fit: sharp.fit.cover,
                //position: sharp.strategy.entropy
            })
            .toFile(filepath)
            // .then( data => {
            //     console.log(data);
            //     fs.writeFileSync(filepath, data);
            // })
            // .catch( err => {
            //     console.log(err);
            // });

        return filename;
    }
    // static filename() {
    //     return `${uuid.v4()}.jpg`;
    // }
    filepath(filename) {
        return path.resolve(`${this.folder}/${filename}`)
    }
}
module.exports = Resize;
