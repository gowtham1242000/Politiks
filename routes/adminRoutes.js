const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/getUserDetails', adminController.getUserDetails);
router.post('/CreateInterest', adminController.CreateInterest);
router.post('/CreateInterest', adminController.CreateInterest);
router.get('/getInterests', adminController.getInterests);




module.exports = router;
