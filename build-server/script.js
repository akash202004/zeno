const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { exec } = require('child_process');
const mime = require('mime-types')
const path = require('path');
const fs = require('fs');

const PROJECT_ID = process.env.PROJECT_ID;

const s3Client = new S3Client({
    region: '',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function init() {
    console.log('Executing script.js...');
    const outDirPath = path.join(__dirname, 'output');

    const p = exec(`cd ${outDirPath} && npm install && npm run build`);

    p.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    p.stdout.on('error', (data) => {
        console.error(`Error: ${data.toString()}`);
    });

    p.on('close', async function () {
        console.log('Build process completed');
        const distFolderPath = path.join(__dirname, 'output', 'dist');
        const distFolderContent = fs.readdirSync(distFolderPath, { recursive: true });

        for (const file of distFolderContent) {
            const filePath = path.join(distFolderPath, file);
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log(`Uploading ${filePath} to S3...`);

            const command = new PutObjectCommand({
                Bucket: '',
                key: `__output/${PROJECT_ID}${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath),
            })

            await s3Client.send(command);

            console.log(`Uploaded ${filePath} to S3`);
        }

        console.log('All files uploaded to S3');
    })
}