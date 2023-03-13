const AWS = require("aws-sdk");
const s3 = new AWS.S3();


async function  store( fileKey, data ) {
    let key = `datafiles/${fileKey}`;
    console.log("data to store", data, key);
    console.log("stringify data", JSON.stringify(data));
    // store something
    var result = await s3.putObject({
        Body: JSON.stringify(data),
        Bucket: process.env.CYCLIC_BUCKET_NAME,
        Key: key,
    }).promise()
    return result;

}

async function  read( fileKey, isArray ) {
    let key = `datafiles/${fileKey}`;

    console.log("reading key", key);
    try {
        let my_file = await s3.getObject({
            Bucket: process.env.CYCLIC_BUCKET_NAME,
            Key: key,
        }).promise();

        console.log("my_file", my_file.Body);
        return JSON.parse(my_file.Body)
    } catch (e) {
        console.log("error", e);
        return isArray? [] : {};
    };
    
}



module.exports.store = store;
module.exports.read = read;
