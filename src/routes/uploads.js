const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/multer');
const { upload } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.post('/', protect, authorize('admin','provider'), uploadMiddleware.single('file'), upload);

module.exports = router;