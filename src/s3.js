const AWS = require("aws-sdk");
const s3 = new AWS.S3();


async function  store( fileKey, data ) {

    console.log("data to store", data);
    // store something
    return await s3.putObject({
        Body: JSON.stringify(data, null, 2),
        Bucket: "cyclic-busy-plum-bull-robe-eu-north-1",
        Key: `datafiles/${fileKey}`,
    }).promise()

}

async function  read( fileKey, isArray ) {

    try {
        let my_file = await s3.getObject({
            Bucket: "cyclic-busy-plum-bull-robe-eu-north-1",
            Key: `datafiles/${fileKey}`,
        }).promise();
        return JSON.parse(my_file)
    } catch {
        return isArray? [] : {};
    };
    
}



module.exports.store = store;
module.exports.read = read;
