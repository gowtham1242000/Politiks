// routes/auth.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// CRUD operations for user management
router.put('/users/:id', verifyToken, userController.updateUser); // Update user details (Admin only)
router.delete('/users/:id', verifyToken, userController.deleteUser); // Delete user (Admin only)
router.get('/users/:id', verifyToken, userController.getUser); // Get user details (Admin only)
router.get('/users', verifyToken, userController.getAllUsers); // List all users (Admin only)

// Register and login routes (do not require token)
router.post('/register', userController.register);
router.post('/createUserDetails/:id', userController.createUserDetails)
router.put('/updateUserDetails/:id', userController.updateUserDetails)
router.post('/login', userController.login);

router.get('/getInterests', userController.getInterests);
router.get('/getInterest/:id',userController.getInterest);
router.delete('/deleteInterest/:id', userController.deleteInterest);

// user Interest
router.post('/createUserInterests/:id', userController.createUserInterests);
router.post('/checkUsername', userController.checkUsername);

//handle follower and following
router.post('/following/:id', userController.following);

//Post
router.post('/createPost/:id', userController.createPost);

//Leader verification
router.post('/uploadVerificationFiles/:id', userController.uploadVerificationFiles)

module.exports = router;


