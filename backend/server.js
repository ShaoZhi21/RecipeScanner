require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const path = require('path');
const app = express();
const port = 5001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Load environment variables
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION,
});

// Set up Multer to use S3 for storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileName = Date.now().toString() + path.extname(file.originalname);
      cb(null, fileName);
    },
  }),
});

// ✅ Upload Image Route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const fileUrl = req.file.location;
  console.log('✅ File uploaded to:', fileUrl);

  res.json({ url: fileUrl });
});

// ✅ Extract Ingredients API (Simulated Response)
app.post('/extract-ingredients', (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).send({ message: "Image URL is required" });
  }

  console.log("Processing image for ingredient extraction:", imageUrl);

  // ✅ Simulated response (Replace with actual API integration)
  const detectedIngredients = ["Tomato", "Onion", "Garlic", "Basil", "Olive Oil"];

  res.json({ ingredients: detectedIngredients });
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
