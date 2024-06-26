// routes/auth.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// CRUD operations for user management
router.put('/users/:id', verifyToken, userController.updateUser); // Update user details (Admin only)
router.delete('/users/:id', verifyToken, userController.deleteUser); // Delete user (Admin only)
router.get('/getuser/:id', userController.getUser); // Get user details (Admin only)
router.get('/users', userController.getAllUsers); // List all users (Admin only)

// Register and login routes (do not require token)
router.post('/register', userController.register);
router.post('/createUserDetails/:id', userController.createUserDetails)
router.put('/updateUserDetails/:id', userController.updateUserDetails)
router.post('/login', userController.login);
router.post('/goToHome/:id', userController.goToHome);

router.get('/getInterests', userController.getInterests);
router.get('/getInterest/:id',userController.getInterest);
router.delete('/deleteInterest/:id', userController.deleteInterest);

// user Interest
router.post('/createUserInterests/:id', userController.createUserInterests);
router.post('/checkUsername', userController.checkUsername);

router.post('/forgetPassword', userController.forgetPassword);
router.post('/verifyOtp', userController.verifyOtp);
router.post('/createPassword', userController.createPassword);



//handle follower and following
router.post('/following/:id', userController.following);
router.get('/getFollowingList/:id', userController.getFollowingList);
//Post
router.post('/createPost/:id', userController.createPost);
router.get('/getUserList/:id', userController.getUserList);
router.get('/getAllPost', userController.getAllPost);
//Leader verification
router.post('/uploadVerificationFiles/:id', userController.uploadVerificationFiles)


router.get('/getUserDetails/:id', userController.getUserDetails);
router.get('/getUserAllPostsByUserId/:id', userController.getUserAllPostsByUserId);

router.get('/getCountry', userController.getCountry);
router.get('/getStates/:id', userController.getStates);

router.get('/getAllMyParties', userController.getAllMyParties);

//comments

router.post('/createComment', userController.createComment);
router.get('/getCommentsByPostId/:id', userController.getCommentsByPostId);
router.post('/createSubComment', userController.createSubComment);

router.put('/updateComment/:commentId', userController.updateComment);

module.exports = router;


