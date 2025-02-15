require('dotenv').config({ path: '../.env' });  // Load environment variables from .env file
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const cors = require('cors');
const path = require('path');

// Set up the Express app
const app = express();
const port = 5001;

// Enable CORS for cross-origin requests from React
app.use(cors());

// Configure AWS S3 using environment variables
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY, // Access key from .env
  secretAccessKey: process.env.AWS_SECRET_KEY, // Secret key from .env
  region: process.env.AWS_REGION, // Region from .env
});

// Set up multer to upload files to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME, // Bucket name from .env
    acl: 'public-read', // File permissions (optional)
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname)); // Unique file name
    },
  }),
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    const fileUrl = req.file.location;
    res.json({ url: fileUrl });
  } else {
    console.error('Error: No file uploaded');
    res.status(400).json({ error: 'No file uploaded' });
  }
});

// Catch all other errors in the backend
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
