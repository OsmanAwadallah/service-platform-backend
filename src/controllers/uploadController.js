const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const upload = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('File required');
  }
  const buffer = req.file.buffer;
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'uploads' },
    (error, result) => {
      if (error) {
        throw new Error(error.message);
      } else {
        res.json({ url: result.secure_url, public_id: result.public_id });
      }
    }
  );
  streamifier.createReadStream(buffer).pipe(stream);
});

module.exports = { upload };