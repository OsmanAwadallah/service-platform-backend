const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const ctrl = require('../controllers/providerController');

router.get('/', ctrl.listProviders);
router.get('/:id', ctrl.getProvider);
router.post('/', protect, authorize('admin','provider','client'), ctrl.createProvider);
router.put('/:id', protect, authorize('provider','admin'), ctrl.updateProvider);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteProvider);

router.post('/:id/reviews', protect, authorize('client'), ctrl.addReview);
router.post('/:id/request', protect, authorize('client'), ctrl.requestProvider);

router.get('/:id/profile', ctrl.getProfile);

router.get('/:id/questions', ctrl.listQuestions);
router.post('/:id/questions', protect, authorize('provider'), ctrl.addQuestion);
router.put('/:id/questions/:questionId', protect, authorize('provider','admin'), ctrl.updateQuestion);
router.delete('/:id/questions/:questionId', protect, authorize('provider','admin'), ctrl.deleteQuestion);

module.exports = router;