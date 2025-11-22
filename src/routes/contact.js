const express = require('express');
const router = express.Router();
const { sendContact, listContacts } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.post('/', sendContact);
router.get('/', protect, authorize('admin'), listContacts);

module.exports = router;