const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Inisialisasi AWS S3
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

// Gunakan multer dengan memory storage, agar file langsung di-handle dalam memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Halaman utama untuk menampilkan file dari S3
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

// Endpoint untuk upload file ke S3
app.post('/upload', upload.single('file'), (req, res) => {
  const fileContent = req.file.buffer;  // File langsung di-memory

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: req.file.originalname,  // Gunakan nama asli file sebagai key di S3
    Body: fileContent,  // Konten file dari memory
  };

  // Upload file ke S3
  s3.upload(params, (err, data) => {
    if (err) {
      return res.send("Upload gagal: " + err);
    }
    res.redirect('/');  // Kembali ke halaman utama setelah berhasil upload
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
