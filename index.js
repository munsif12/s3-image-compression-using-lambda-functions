const sharp = require('sharp') // https://github.com/Umkus/lambda-layer-sharp  (downlaod and add sharp library to your lambda layer)
const AWS = require("aws-sdk")
exports.handler = async (event) => {
    try {
        console.log("Incoming Event S3: ", event.Records[0].s3);
        const Bucket = event.Records[0].s3.bucket.name;
        const fileName = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
        const message = `Bucket - ${Bucket} ->  Filename - ${fileName}`;
        console.log(message)

        AWS.config.update({
            accessKeyId: "*************", //your aceess key here
            secretAccessKey: "***************************", //your secret key here
            region: "us-east-1"
        })

        const S3 = new AWS.S3({});
        var params = { Bucket, Key: fileName };
        
        // first get the image you want to compress from s3 bucket
        const uncompressedImage = await S3.getObject({
            ...params
        }).promise();

        console.log(uncompressedImage)
        console.log('******************** FILE DOWNLOADED **************************')

        const metadata = await sharp(uncompressedImage.Body).metadata();
        console.log('******************** FILE METADATA **************************')

        //compress image using sharp library
        const compressedImageBuffer = await sharp(uncompressedImage.Body)
            .resize({
                width: metadata.width,
                height: metadata.height
            })
            .toFormat("jpeg", { mozjpeg: true })
            .toBuffer();
        console.log('******************** FILE COMPRESSED **************************')

        //upload the compressed image to a different bucket else you will end up recursiverly calling the lambda
        const compressedImageData = await S3.upload({
            ...params,
            Bucket: 'test-source-buket',
            // key:`compressed-images/${fileName}`,
            Body: compressedImageBuffer,
            ContentType: "image"
        }).promise();

        console.log(compressedImageData)
        console.log('******************** FILE UPLPOADED AGAIN **************************')
        return compressedImageData;
    } catch (e) {
        console.log('[ERROR]:', e.message)
    }
};
