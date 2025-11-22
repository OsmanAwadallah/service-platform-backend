const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dataController');

router.get('/:table', ctrl.list);
router.get('/:table/:id', ctrl.getOne);
router.post('/:table', ctrl.createOne);
router.put('/:table/:id', ctrl.updateOne);
router.delete('/:table/:id', ctrl.deleteOne);

module.exports = router;