const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/getUserDetails', adminController.getUserDetails);
router.post('/CreateInterest', adminController.CreateInterest);
router.post('/CreateInterest', adminController.CreateInterest);
router.get('/getInterests', adminController.getInterests);
router.get('/getLeaderDetails', adminController.getLeaderDetails);


router.post('/adminRegister', adminController.adminRegister);
router.post('/adminLogin', adminController.adminLogin);

router.post('/createAdminSetting', adminController.createAdminSetting);

// Get AdminSetting
router.get('/getAdminSetting', adminController.getAdminSetting);

// Update AdminSetting
router.put('/updateAdminSetting', adminController.updateAdminSetting);
router.get('/getApprovedLeaders', adminController.getApprovedLeaders);

// Delete AdminSetting (Optional)
router.delete('/deleteAdminSetting', adminController.deleteAdminSetting);

router.put('/updateUserDetails/:id', adminController.updateUserDetails)
router.post('/createCountry', adminController.createCountry);
router.post('/createState/:id', adminController.createState);
router.post('/bulkCreateState/:id', adminController.bulkCreateState);


router.post('/createAdminRole', adminController.createAdminRole);
router.get('/getAllAdminRole', adminController.getAllAdminRole);
router.put('/updateAdminRolePermissions/:id', adminController.updateAdminRolePermissions);
router.delete('/deleteAdminRole/:id', adminController.deleteAdminRole);

router.post('/createAdminUser', adminController.createAdminUser);
router.get('/getAdminUser', adminController.getAdminUser);
router.put('/updateAdminUser/:id', adminController.updateAdminUser);
router.delete('/deleteAdminUser/:id', adminController.deleteAdminUser);

router.post('/createMyParty', adminController.createMyParty);
router.get('/getAllMyParties', adminController.getAllMyParties);
router.put('/updateMyParty/:id', adminController.updateMyParty);
router.delete('/deleteMyParty/:id', adminController.deleteMyParty);

module.exports = router;
