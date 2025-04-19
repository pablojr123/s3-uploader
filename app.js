const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // ✅ langsung ke memory

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', async (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    res.render('index', { files: data.Contents });
  } catch (err) {
    res.send("Error listing files: " + err);
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: req.file.originalname,
    Body: req.file.buffer, // ✅ dari memory langsung
  };

  s3.upload(params, (err, data) => {
    if (err) {
      return res.send("Upload gagal: " + err);
    }
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
