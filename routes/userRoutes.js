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



//Post
router.post('/createPost/:id', userController.createPost);
router.get('/getUserList/:id', userController.getUserList);
router.get('/getAllPost/:userId', userController.getAllPost);
//Leader verification
router.post('/uploadVerificationFiles/:id', userController.uploadVerificationFiles)


router.get('/getUserDetails/:id', userController.getUserDetails);
router.get('/getUserAllPostsByUserId/:id', userController.getUserAllPostsByUserId);

router.get('/getCountry', userController.getCountry);
router.get('/getStates/:id', userController.getStates);

router.get('/getAllMyParties', userController.getAllMyParties);

//comments

router.post('/createComment', userController.createComment);
router.get('/getCommentsByPostId/:postId/:userId', userController.getCommentsByPostId);

router.post('/createSubComment', userController.createSubComment);

router.put('/updateComment/:commentId', userController.updateComment);
router.delete('/deleteComment/:commentId/:userId', userController.deleteComment);

//handel like comment

router.post('/likeComment/:commentId', userController.likeComment);
router.post('/unlikeComment/:commentId', userController.unlikeComment);

router.post('/likeSubComment/:commentId', userController.likeSubComment);
router.post('/unlikeSubComment/:subCommentId', userController.unlikeSubComment);

router.put('/updateSubComment/:subCommentId', userController.updateSubComment);
router.delete('/deleteSubComment/:subCommentId/:userId', userController.deleteSubComment);

//Follow

router.post('/followUser/:userId', userController.followUser);
router.post('/unfollowUser/:userId', userController.unfollowUser);
router.get('/getFollowers/:userId' , userController.getFollowers);
router.get('/getFollowing/:userId' , userController.getFollowing);

//suggestion

router.get('/suggestions/:userId' , userController.suggestions);

router.post('/likeUnlikePost/:postId', userController.likeUnlikePost);

router.get('/likedUserList/:postId', userController.likedUserList);

//Repost

router.post('/createRepost/:postId', userController.createRepost);

//Reels
router.post('/createReel/:userId', userController.createReel);
router.put('/updateReel/:reelId', userController.updateReel);
router.get('/getReelByUserId/:userId', userController.getReelByUserId);
router.delete('/deleteReel/:reelId', userController.deleteReel);
router.get('/getAllReels', userController.getAllReels);

router.get('/getShareFollowerList/:userId', userController.getShareFollowerList);

router.get('/searchUsers', userController.searchUsers);

router.get('/getNotifications/:userId', userController.getNotifications);

module.exports = router;


