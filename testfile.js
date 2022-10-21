const aws = require('aws-sdk');
const fs = require('fs');
const compress_images = require("compress-images");

function f() {

    aws.config.update({
        accessKeyId: "AKIA4UFCCLUUPFQYHBXS",
        secretAccessKey: "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",
        // signatureVersion: config.signature_version,
        region: "eu-west-2"
    })

    const s3 = new aws.S3({});

    const fileName = '123123.PNG';
    var params = { Bucket: 'bdibucket1', Key: fileName };

    s3.getObject(params, function (err, data) {
        if (err) {
            console.log(err)
        }
        else {
            console.log(data)
            console.log(fileName);
            const fileData = data.Body;
            const base64Image = Buffer.from(fileData).toString('base64');
            console.log('before writing file to lambda function')
            fs.writeFileSync(`./tmp/${fileName}`, base64Image, "base64", () => { console.log('file written successfully') });
            console.log('file written successfully');


            //now get the file and compress it
            const image = fs.createReadStream(`./tmp/${fileName}`)
            image.on('open', function () {
                // This just pipes the read stream to the response object (which goes to the client)
                console.log('file opened successfully')
                // image.pipe(res);
            });

            image.on('error', function (err) {
                console.log('[ERROR]', err.message)
            })
            compress_images(
                `tmp/${fileName}`,
                "tmp/compress/",
                { compress_force: false, statistic: true, autoupdate: true },
                false,
                { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
                { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
                { svg: { engine: "svgo", command: "--multipass" } },
                {
                    gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] },
                },
                function (err, completed) {
                    if (completed === true) {
                        // Doing something.
                        console.log('compressed')
                    }
                }
            );
            // console.log(image)

        }
    });

}





f()
