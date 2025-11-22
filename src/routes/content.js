const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contentController');

router.get('/team', ctrl.getTeam);
router.get('/team/:id', ctrl.getById);
router.get('/portfolio', ctrl.getPortfolio);
router.get('/events', ctrl.getEvents);
router.get('/testimonials', ctrl.getTestimonials);

module.exports = router;