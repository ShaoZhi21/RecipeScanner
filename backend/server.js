require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');  
const multerS3 = require('multer-s3');
const path = require('path');
const app = express();
const port = 5001;
const { OpenAI } = require('openai');

app.use(cors({
  origin: 'http://localhost:3000', 
}));

// Load environment variables
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION,
});

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY, // Use the OpenAI API key from .env
});

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

console.log(AWS.config.credentials);

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_S3_BUCKET_NAME,
    acl: 'public-read',  // Make the file publicly readable
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileName = Date.now().toString() + path.extname(file.originalname);
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,  // Automatically set content type based on file extension
  }),
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const fileUrl = req.file.location;
  console.log('File uploaded to:', fileUrl);

  const objectUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${req.file.key}`;
  console.log('Object URL:', objectUrl);

  // Query OpenAI API to describe the image
  openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Find all the food in this image and output only the ingredients to me in JSON format?" },
          {
            type: "image_url",
            image_url: {
              url: objectUrl, // Send the uploaded image URL
            },
          },
        ],
      },
    ],
    store: true,
  }).then((response) => {
    // Handle OpenAI response
    const description = response.choices[0]?.message?.content;
    res.json({ url: objectUrl, description: description });
  }).catch((error) => {
    console.error('Error querying OpenAI API:', error);
    res.status(500).json({ message: 'Error querying OpenAI API' });
  });
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});