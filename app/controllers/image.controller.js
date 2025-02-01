var dotenv = require('dotenv');
dotenv.config()

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({
    region: process.env.DO_SPACES_ENDPOINT,
    endpoint: `https://${process.env.DO_SPACES_ENDPOINT}`,
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET
    },
    forcePathStyle: false
});

async function uploadToBucket(file) {
    const { content, name, type } = file;
  
    const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: `${uuidv4()}_${name}`,
        Body: Buffer.from(content, 'base64'),
        ContentType: type,
        ACL: 'public-read'
    };
  
    const command = new PutObjectCommand(params);
    const upload = await s3.send(command);
    console.log(`https://${process.env.DO_SPACES_ENDPOINT}/${process.env.DO_SPACES_BUCKET}/${params.Key}`);
    return `https://${process.env.DO_SPACES_ENDPOINT}/${process.env.DO_SPACES_BUCKET}/${params.Key}`;
}

const uploadImage = async (req, res) => {
    const { file } = req.body;

    try {
        const fileUrl = await uploadToBucket(file);
        console.log(fileUrl);
        return res.status(200).json({ url: fileUrl });
    } catch (error) {
        console.error('Error uploading :', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { uploadImage };