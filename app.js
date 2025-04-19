const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();

// Set multer untuk memproses file upload menggunakan memory storage
const storage = multer.memoryStorage(); // Gunakan memory storage supaya file disimpan langsung di memory
const upload = multer({ storage: storage });

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Endpoint untuk menampilkan file yang ada di S3
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

// Endpoint untuk upload file
app.post('/upload', upload.single('file'), (req, res) => {
  // Pastikan file ada di memory (req.file.buffer)
  if (!req.file) {
    return res.send("No file uploaded!");
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: req.file.originalname, // Gunakan nama file yang diupload
    Body: req.file.buffer, // Menggunakan file yang ada di memory
    ContentType: req.file.mimetype, // Tentukan jenis konten file
    ACL: 'public-read', // Atur akses sesuai kebutuhan (public-read jika ingin file bisa diakses publik)
  };

  s3.upload(params, (err, data) => {
    if (err) {
      return res.send("Upload gagal: " + err);
    }
    res.redirect('/'); // Setelah upload berhasil, redirect ke halaman utama
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
