/*const AWS_S3 = require("@aws-sdk/client-s3");
const s3 = new AWS_S3.S3Client({});

async function store( fileKey, data ) {
    let key = `datafiles/${fileKey}`;
    let params = {
        Body: JSON.stringify(data, null, 2),
        Bucket: process.env.CYCLIC_BUCKET_NAME,
        Key: key,
    };
    return await s3.send(new AWS_S3.PutObjectCommand(params));
}

async function read( fileKey, isArray ) {
    let key = `datafiles/${fileKey}`;
    const command = new AWS_S3.GetObjectCommand({
        Bucket: process.env.CYCLIC_BUCKET_NAME,
        Key: key
    });

    try {
        const response = await s3.send(command);
        // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
        const str = await response.Body.transformToString();
        return JSON.parse(str);
    } catch (err) {
        console.error(err);
        return isArray? [] : {};
    }  
}*/

const fs = require('fs');
const path = require('path');

async function store (fileKey, data) {
    return data;
}

async function read (fileKey, isArray) {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '.data', fileKey)));
}



module.exports.store = store;
module.exports.read = read;
