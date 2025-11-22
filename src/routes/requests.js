const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const ctrl = require('../controllers/requestController');

router.get('/', protect, authorize('provider','admin'), ctrl.listRequests);
router.post('/', protect, authorize('client'), ctrl.createRequest);
router.put('/:id', protect, authorize('provider','admin'), ctrl.updateRequest);
router.delete('/:id', protect, ctrl.deleteRequest);

module.exports = router;