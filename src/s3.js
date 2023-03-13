const AWS = require("aws-sdk");
const s3 = new AWS.S3();


async function  store( fileKey, data ) {
    let key = `datafiles/${fileKey}`;
    // store something
    var result = await s3.putObject({
        Body: JSON.stringify(data, null, 2),
        Bucket: process.env.CYCLIC_BUCKET_NAME || "cyclic-busy-plum-bull-robe-eu-north-1",
        Key: key,
    }).promise()
    return result;

}

async function  read( fileKey, isArray ) {
    let key = `datafiles/${fileKey}`;
    try {
        let my_file = await s3.getObject({
            Bucket: process.env.CYCLIC_BUCKET_NAME || "cyclic-busy-plum-bull-robe-eu-north-1",
            Key: key,
        }).promise();

        return JSON.parse(my_file.Body.toString())
    } catch (e) {
        console.log("error", e);
        return isArray? [] : {};
    };
    
}



module.exports.store = store;
module.exports.read = read;
