const AWS = require("aws-sdk");
const s3 = new AWS.S3();


async function  store( fileKey ) {
    // store something
    return await s3.putObject({
        Body: JSON.stringify({key:"value"}),
        Bucket: "cyclic-busy-plum-bull-robe-eu-north-1",
        Key: fileKey,
    }).promise()

}

async function  read( fileKey ) {
    let my_file = await s3.getObject({
        Bucket: "cyclic-busy-plum-bull-robe-eu-north-1",
        Key: fileKey,
    }).promise();


    if ( my_file ) {
        JSON.parse(my_file)
    } else {
        return {};
    }
}


module.exports.store = store;
module.exports.read = read;
