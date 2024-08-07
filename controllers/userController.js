const User = require('../models/User');
const Interest = require('../models/Interest');
const UserDetails = require('../models/UserDetail');
const UserInterest = require('../models/UserInterest');
const LeaderVerify = require('../models/LeaderVerify');
const Follow = require('../models/Follow');
//const { Sequelize } = require('../models');
const UserForgetOtp = require('../models/UserForgetOtp');
const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');
const PostLike = require('../models/PostLike');
const Reel = require('../models/Reel');
const Notification = require('../models/Notification');

const Country = require('../models/Country');
const State = require('../models/State');
const MyParty = require('../models/MyParty');
const Comment = require('../models/Comment');
const SubComment = require('../models/SubComment');
//const Notification = require('../models/Notification');
const CommentLike = require('../models/CommentLike');
const SubCommentLike = require('../models/SubCommentLike');


const { generateOTP, sendOTP } = require('../middleware/otpService');

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key_12345';
const {Sequelize} =require('sequelize')

// Ensure your function is declared as an async function
/*
exports.register = async (req, res) => {
  const { email, password, userName, googleId } = req.body;
console.log("req.body----",req.body)
  try {
      if (googleId) {
          // Social login flow via Google OAuth
          let user = await User.findOne({ where: { googleId } });

          if (user) {
              // User exists, handle accordingly (e.g., update user details if needed)
              return res.status(200).json({ message: 'User already exists', user });
          }

          // Create new user for Google OAuth
              user = await User.create({
              email,
              fullName: userName, // Assuming userName maps to fullName
              googleId,
              // Add other relevant fields
          });

          // Optionally generate JWT token and respond
          // const token = generateJWTToken(user); // Implement this function as needed

          return res.json({ message: 'User registered successfully', user });
      }
 
try{
if (googleId) {
  // Social login flow via Google OAuth
 	 let user = await User.findOne({ where: { googleId } });
	console.log("user------------------",user)
  	if (user) {
		console.log("user-----------alredy------------exit")
    // User exists, handle accordingly (e.g., update user details if needed)
//    		return res.status(400).json({ message: 'User already exists', user });
//	  }

  // Check if a user with the provided email already exists
  	const existingUser = await User.findOne({ where: { email } });
	console.log("existingUser-----------------",existingUser);

  	if (existingUser) {
    		const userDetails = await UserDetails.findOne({ where: { userId: existingUser.id } });
    		console.log("userDetails-----------------", userDetails);

    		if (!userDetails) {
      // User exists but no details, remove the user
      			await User.destroy({ where: { id: existingUser.id } });
    		} else if (userDetails.action === 'Pending' || userDetails.action === 'Declined') {
      // Remove old user and details
      			await UserDetails.destroy({ where: { userId: existingUser.id } });
      			await User.destroy({ where: { id: existingUser.id } });
    		} else {
      			return res.status(400).json({ message: 'User already exists or not allowed to register' });
    		}
  	}
	}
  // Create new user for Google OAuth
  user = await User.create({
    email,
    fullName: userName, // Assuming userName maps to fullName
    googleId,
    // Add other relevant fields
  });

  // Optionally generate JWT token and respond
  // const token = generateJWTToken(user); // Implement this function as needed

  return res.json({ message: 'User registered successfully', user });
}    
  else {
console.log("entering the sourse-----------------&&&&&&&&&&&&&&&&&&_________________****************")
      // Normal registration flow with email and password
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        const userDetails = await UserDetails.findOne({ where: { userId: existingUser.id } });
console.log("userDetails-----------------",userDetails)
//return
        if (!userDetails) {
          // User exists but no details, remove the user
          await User.destroy({ where: { id: existingUser.id } });
        } else if (userDetails.action === 'Pending' || userDetails.action === 'Declined') {
          // Remove old user and details
          await UserDetails.destroy({ where: { userId: existingUser.id } });
          await User.destroy({ where: { id: existingUser.id } });
        } else {
          return res.status(400).json({ message: 'User already exists or not allowed to register' });
        }
      }

      // Proceed with normal registration logic
      const newUser = await User.create({
        email,
        password, // Assuming password is passed correctly
        fullName: userName || null,
        // Add other relevant fields
      });

      // Optionally generate JWT token and respond
      // const token = generateJWTToken(newUser); // Implement this function as needed

      return res.status(201).json({ message: 'User registered successfully', user: newUser });
    }
  } catch (error) {
    console.error('Error processing registration or social login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
*/

exports.register = async (req, res) => {
  const { email, password, userName, googleId } = req.body;

  try {
    if (googleId) {
      // Social login flow via Google OAuth
      let user = await User.findOne({ where: { googleId } });
      console.log("user------------------", user);

      if (user) {
        // Check if a user with the provided email already exists
        const existingUser = await User.findOne({ where: { email } });
        console.log("existingUser-----------------", existingUser.id);
//return
        if (existingUser) {
          const userDetails = await UserDetails.findOne({ where: { userId: existingUser.id } });
          console.log("userDetails-----------------", userDetails);

          if (!userDetails) {
            // User exists but no details, remove the user
            await LeaderVerify.destroy({ where: { userId: existingUser.id } });
	    await UserInterest.destroy({ where: { userId: existingUser.id } });
            await User.destroy({ where: { id: existingUser.id } });
          }
           else if (userDetails.action === 'Pending' || userDetails.action === 'Declined' && userDetails.role == " Leader") {
             //Remove old user and details
          //  await UserDetails.destroy({ where: { userId: existingUser.id } });
            //await User.destroy({ where: { id: existingUser.id } });
	    return res.status(400).json({ message: 'Admin will not Approve kindle weit for some Time' });
          }
	   else if (userDetails.action === 'Approved' && userDetails.status === true) {
            // UserDetails is available and action is Approved and status is true, allow login
            return res.status(200).json({ message: 'Login successful', user: existingUser });
          } 
	else {
            return res.status(400).json({ message: 'User already exists or not allowed to register' });
          }
        }
      }

      // Create new user for Google OAuth
      user = await User.create({
        email,
        fullName: userName, // Assuming userName maps to fullName
        googleId,
        // Add other relevant fields
      });

      // Optionally generate JWT token and respond
      // const token = generateJWTToken(user); // Implement this function as needed

      return res.json({ message: 'User registered successfully', user });
    } else {
      console.log("Normal registration flow");

      // Normal registration flow with email and password
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        const userDetails = await UserDetails.findOne({ where: { userId: existingUser.id } });
        console.log("userDetails-----------------", userDetails);

        if (!userDetails) {
          // User exists but no details, remove the user
          await User.destroy({ where: { id: existingUser.id } });
        } else if (userDetails.action === 'Pending' || userDetails.action === 'Declined') {
          // Remove old user and details
          await UserDetails.destroy({ where: { userId: existingUser.id } });
          await User.destroy({ where: { id: existingUser.id } });
        } else {
          return res.status(400).json({ message: 'User already exists or not allowed to register' });
        }
      }

      // Proceed with normal registration logic
      const newUser = await User.create({
        email,
        password, // Assuming password is passed correctly
        fullName: userName || null,
        // Add other relevant fields
      });

      // Optionally generate JWT token and respond
      // const token = generateJWTToken(newUser); // Implement this function as needed

      return res.status(201).json({ message: 'User registered successfully', user: newUser });
    }
  } catch (error) {
    console.error('Error processing registration or social login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.createUserDetails = async (req, res) => {
    const { userName, role, dateOfBirth, gender, country, state } = req.body;

    const userId = req.params.id;
    console.log("userId",userId);

    try {
      const id =userId ;
      console.log("id----",id) // Replace with the actual userId you want to find

      const user = await User.findOne({
          where: {
              id: id
          }
      });
      
        console.log("user--------",user);
        // return
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingUserDetails = await UserDetails.findOne({ where: { userId } });
        if (existingUserDetails) {
            return res.status(400).json({ message: 'User details already exist' });
        }

        const status = (role === 'Follower') ? true : false;
        console.log("user.mail------------",user.email);
       let action = (role === 'Follower') ? 'Approved' : 'Pending'; // Set action based on role  

        const userDetails = await UserDetails.create({
            userId,
            userName,
            mailId:user.email,
            role,
            dateOfBirth,
            gender,
            country,
            state,
            status,
            action
        });

        res.status(201).json({ message: 'User details created successfully', userDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
  };

exports.checkUsername = async (req, res) => {
    const { userName } = req.body;

    try {
        const existingUser = await UserDetails.findOne({ where: { userName } });

        if (existingUser) {
            return res.status(400).json({ message: 'User name already exists, please choose another one.' });
        }

        res.status(200).json({ message: 'User name is available.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login payload:", req.body); // Log request body for debugging

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = user.id;
        console.log("userId:", userId);

        const userDetails = await UserDetails.findOne({ where: { userId } });
        console.log("userDetails:", userDetails);

        if (!userDetails) {
            return res.status(404).json({ message: 'User details not found' });
        }

        // Check if the password matches
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check user status in UserDetails
        if (!userDetails.status) {
            return res.status(403).json({ message: 'User account not approved yet' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        // Save token to the database
        user.token = token;
        await user.save();

        res.status(200).json({ message: 'Login successful', token , user});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.goToHome = async (req, res) => {
  const userId = req.params.id;
console.log("user-------id-----------------------------------------------------------------------------------------------------------------sbhhjuinedncjnjnsjmck------------------------------------############################################---------------------###########################---------------",req.params.id);
  try {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userDetails = await UserDetails.findOne({ where: { userId: user.id } });

    if (userDetails && (userDetails.action === 'Pending' || userDetails.action === 'Declined')) {
      return res.status(400).json({ message: 'Profile not approved by admin. Please contact support.' });
    }

    // Assuming you have a method to validate password if needed
    // if (!user.validPassword(user.password)) {
    //     return res.status(401).json({ message: 'Invalid password' });
    // }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    user.token = token;
    await user.save();

    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.forgetPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Generate OTP
      const otp = generateOTP();
  
      // Save OTP and expiry time (10 minutes from now) to UserForgetOtp table
      const otpRecord = await UserForgetOtp.findOne({ where: { userId: user.id } });
      if (otpRecord) {
        // Update existing record
        otpRecord.otp = otp;
        otpRecord.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        await otpRecord.save();
      } else {
        // Create new record
        await UserForgetOtp.create({
          userId: user.id,
          otp,
          otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes from now
        });
      }
  
      // Send OTP to user's email
      await sendOTP(email, otp);
  
      res.status(200).json({ message: 'OTP sent to your email',user });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };



  exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Find OTP record for the user
      const otpRecord = await UserForgetOtp.findOne({ where: { userId: user.id } });
      if (!otpRecord) {
        return res.status(404).json({ message: 'OTP record not found' });
      }
  
      // Verify OTP
      const isOTPValid = otp === otpRecord.otp; // Simple comparison for demonstration
      if (!isOTPValid) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      // Check OTP expiry
      const currentTime = Date.now();
      if (currentTime > otpRecord.otpExpires) {
        return res.status(400).json({ message: 'OTP expired' });
      }
  
      // If OTP is valid and not expired, you can proceed with further actions
      // For example, reset password or redirect to a password reset form
  
      res.status(200).json({ message: 'OTP verified successfully',user });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.createPassword = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update user's password
      user.password = password;
      await user.save();
  
      // Delete the OTP record
      await UserForgetOtp.destroy({ where: { userId: user.id } });
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };




// Delete user
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId, {
      include: UserDetails, // Include UserDetails association
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// List all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Update user details
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { email, password, role, status, uniqueName, iam, dateOfBirth, gender, country, state, interests, accountsToFollow } = req.body;

    try {
        let user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields based on what is provided in the request body
        if (email) user.email = email;
        if (password) user.password = password;
        if (role) user.role = role;
        if (status !== undefined) user.status = status;
        if (uniqueName) user.uniqueName = uniqueName;
        if (iam) user.iam = iam;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;
        if (country) user.country = country;
        if (state) user.state = state;
        if (interests) user.interests = interests;
        if (accountsToFollow) user.accountsToFollow = accountsToFollow;

        await user.save();

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



  exports.getInterests = async (req, res) => {
    try {
      const interests = await Interest.findAll();
      res.status(200).json(interests);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.getInterest = async (req, res) => {
    const { id } = req.params;
    try {
      const interest = await Interest.findByPk(id);
      if (!interest) {
        return res.status(404).json({ error: 'Interest not found' });
      }
      res.status(200).json(interest);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.deleteInterest = async (req, res) => {
    const { id } = req.params;
    try {
      const interest = await Interest.findByPk(id);
      if (!interest) {
        return res.status(404).json({ error: 'Interest not found' });
      }
      await interest.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  exports.createUserInterests = async (req, res) => {
    const { interestIds } = req.body;
    const userId = req.params.id;

    try {
        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if all interestIds exist
        const interests = await Interest.findAll({
            where: { id: interestIds }
        });
	const interestNames = interests.map(interest => interest.name);
console.log("interestNames----------",interestNames);
//return
        if (interests.length !== interestIds.length) {
            return res.status(404).json({ message: 'One or more interests not found' });
        }

        // Update the UserDetails table
        const userDetails = await UserDetails.findOne({ where: { userId } });
        if (!userDetails) {
            return res.status(404).json({ message: 'User details not found' });
        }
        userDetails.myInterest = interestIds;
        userDetails.myInterestField = interestNames;
        await userDetails.save();

        // Remove existing interests from UserInterest
        await UserInterest.destroy({ where: { userId: userId } });

        // Create new user interests
        const newUserInterests = await Promise.all(interestIds.map(async (interestId) => {
            return await UserInterest.create({
                userId: userId,
                interestId
            });
        }));

        res.status(201).json({ message: 'User interests created successfully', userInterests: newUserInterests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const saveImage = (file, userId) => {
  const userDir = path.join('/etc/ec/data/post', userId.toString());
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const filePath = path.join(userDir, file.name.replace(/\s+/g, '_'));
  fs.writeFileSync(filePath, file.data);
  return filePath;
};

const savePostVideo = (file, userId) => {
  const userDir = path.join('/etc/ec/data/post', userId.toString());
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const PostfilePath = path.join(userDir, file.name.replace(/\s+/g, '_'));
  fs.writeFileSync(PostfilePath, file.data);
  return PostfilePath;
};

exports.createPost = async (req, res) => {
  const { tagUser, caption, location } = req.body;
  const userId = req.params.id;
  const images = req.files && req.files.image;
  const videoFile = req.files && req.files.video;

  try {
    const post = await Post.create({ 
      userId, 
      location: location || null, 
      tagUser: tagUser || null, 
      caption: caption || null,
      video: null // Initially set video field to null
    });

    if (images) {
      const imageUrls = [];

      if (Array.isArray(images)) {
        // Handle multiple images
        images.forEach(image => {
          const imagePath = saveImage(image, userId);
          const imageUrl = `https://politiks.aindriya.co.uk/post/${userId}/${path.basename(imagePath)}`;
          imageUrls.push(imageUrl);
        });
      } else {
        // Handle single image
        const imagePath = saveImage(images, userId);
        const imageUrl = `https://politiks.aindriya.co.uk/post/${userId}/${path.basename(imagePath)}`;
        imageUrls.push(imageUrl);
      }

      // Save image URLs in the Post model
      post.image = imageUrls;
      await post.save();
    }

    if (videoFile) {
      // Handle video file
      const videoPath = savePostVideo(videoFile, userId);
      const videoUrl = `https://politiks.aindriya.co.uk/post/${userId}/${path.basename(videoPath)}`;
      
      // Update the post with video URL
      post.video = videoUrl;
      await post.save();
    }

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getAllPost = async (req, res) => {
  const userId = parseInt(req.params.userId, 10); // Ensure userId is an integer
  console.log("User ID from request params:", userId);

  try {
    // Step 1: Fetch all posts in descending order of createdAt
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
    });

    // Step 2: Extract postIds and userIds from posts
    const postIds = posts.map(post => post.id);
    const userIds = posts.map(post => post.userId);
    const originalPostIds = posts.map(post => post.originalPostId).filter(id => id !== null);

    // Step 3: Fetch user details for the extracted userIds
    const userDetails = await UserDetails.findAll({
      where: { userId: userIds },
    });

    // Step 4: Fetch all likes and comments for the posts
    const postLikes = await PostLike.findAll({
      where: { postId: postIds },
    });
    const postComments = await Comment.findAll({
      where: { postId: postIds },
    });

    // Step 5: Fetch original posts if they exist
    const originalPosts = await Post.findAll({
      where: { id: originalPostIds },
    });

    const originalPostDetails = await Promise.all(originalPosts.map(async originalPost => {
      const userDetail = await UserDetails.findOne({
        where: { userId: originalPost.userId },
      });
      let imageArray;
      try {
        imageArray = JSON.parse(originalPost.image);
      } catch (error) {
        imageArray = [originalPost.image]; // If parsing fails, fallback to single image
      }
      return {
        id: originalPost.id,
        userId: originalPost.userId,
        image: imageArray,
        video: originalPost.video,
        location: originalPost.location,
        tagUser: originalPost.tagUser,
        caption: originalPost.caption,
        userDetails: {
          id: userDetail.userId,
          userName: userDetail.userName,
          email: userDetail.email,
          userProfile: userDetail.userProfile,
          location: userDetail.state,
          createdAt: userDetail.createdAt,
          updatedAt: userDetail.updatedAt,
        }, // Include only updatedAt field
      };
    }));

    // Create a map for quick access to original post details
    const originalPostMap = {};
    originalPostDetails.forEach(detail => {
      originalPostMap[detail.id] = detail;
    });

    console.log("Post likes fetched:", postLikes);
    console.log("Post comments fetched:", postComments);

    // Step 6: Combine posts, user details, like count, comment count, liked flag, and original post details into a single response
    const postsWithDetails = posts.map(post => {
      const userDetail = userDetails.find(detail => detail.userId === post.userId);
      const likeCount = postLikes.filter(like => like.postId === post.id).length;
      const commentCount = postComments.filter(comment => comment.postId === post.id).length;

      const liked = postLikes.some(like => like.postId === post.id && like.userId === userId);
      const originalPostDetail = post.originalPostId ? originalPostMap[post.originalPostId] : null;

      let imageArray;
      try {
        imageArray = JSON.parse(post.image);
      } catch (error) {
        imageArray = [post.image]; // If parsing fails, fallback to single image
      }

      // Check if the image array contains only null values
      if (imageArray && imageArray.length === 1 && imageArray[0] === null) {
        imageArray = null;
      }

      const formattedPost = {
        id: post.id,
        userId: post.userId,
        image: imageArray, // Use 'images' instead of 'image' for consistency
        video: post.video,
        location: post.location,
        tagUser: post.tagUser,
        caption: post.caption,
        likeCount: likeCount,
        commentCount: commentCount,
        liked: liked,
        userDetails: userDetail ? {
          id: userDetail.userId,
          userName: userDetail.userName,
          email: userDetail.email,
          userProfile: userDetail.userProfile,
          location: userDetail.state,
          createdAt: userDetail.createdAt,
          updatedAt: userDetail.updatedAt,
        } : null,
      };

      if (originalPostDetail) {
        formattedPost.isRepost = true;
        formattedPost.repostDetails = {
          id: originalPostDetail.id,
          userId: originalPostDetail.userId,
          image: originalPostDetail.image,
          video: originalPostDetail.video,
          location: originalPostDetail.location,
          tagUser: originalPostDetail.tagUser,
          caption: originalPostDetail.caption,
          userDetails: originalPostDetail.userDetails, // Ensure userDetails is included
        };

        // Swap the user details to reflect the original post user and repost user
        const originalUserDetails = formattedPost.userDetails;
        formattedPost.userDetails = formattedPost.repostDetails.userDetails;
        formattedPost.repostDetails.userDetails = originalUserDetails;
      }

      return formattedPost;
    });

    res.status(200).json(postsWithDetails);
  } catch (error) {
    console.error('Error fetching posts with details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getUserList = async (req, res) => {
  const userId = req.params.id; // Assuming the userId is passed in the headers

  try {
    // Fetch all users except the one with the specified userId
    const users = await UserDetails.findAll({
      where: {
        userId: {
          [Sequelize.Op.ne]: userId
        }
      },
      attributes: ['userId', 'userName', 'country', 'userProfile'] // Specify the attributes you want to retrieve
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  //handle updateUserDetails

const userProfileDir = '/etc/ec/data/UserProfile'; // Define the directory to store profile images
const userBannerDir = '/etc/ec/data/UserBanner'; // Define the directory to store profile banners

// Ensure the directories exist
if (!fs.existsSync(userProfileDir)) {
    fs.mkdirSync(userProfileDir, { recursive: true });
}
if (!fs.existsSync(userBannerDir)) {
    fs.mkdirSync(userBannerDir, { recursive: true });
}

// Function to save images
const saveImages = (file, userId, dir) => {
    const userDir = path.join(dir, userId.toString());
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }

    const filePath = path.join(userDir, file.name.replace(/\s+/g, '_'));
    fs.writeFileSync(filePath, file.data);
    return filePath;
};

exports.updateUserDetails = async (req, res) => {
  const { userName, dateOfBirth, gender, country, state, mySelf, myParty, myInterest } = req.body;
  const userId = req.params.id;

  try {
    const userDetails = await UserDetails.findOne({ where: { userId } });
    if (!userDetails) {
      return res.status(404).json({ message: 'User details not found' });
    }

    // Only update the fields that are provided
    if (userName) userDetails.userName = userName;
    if (dateOfBirth) userDetails.dateOfBirth = dateOfBirth;
    if (gender) userDetails.gender = gender;
    if (country) userDetails.country = country;
    if (state) userDetails.state = state;
    if (mySelf) userDetails.mySelf = mySelf;
    if (myParty) userDetails.myParty = myParty;

    // Save profile banner if provided
    if (req.files && req.files.userBannerProfile) {
      const userBannerProfile = req.files.userBannerProfile;
      const userBannerProfilePath = saveImages(userBannerProfile, userId, userBannerDir);
      const userBannerProfileUrl = `https://politiks.aindriya.co.uk/UserBanner/${userId}/${userBannerProfile.name.replace(/\s+/g, '_')}`;
      userDetails.userBannerProfile = userBannerProfileUrl;
    }

    // Save profile image if provided
    if (req.files && req.files.userProfile) {
      const userProfile = req.files.userProfile;
      const userProfilePath = saveImages(userProfile, userId, userProfileDir);
      const userProfileUrl = `https://politiks.aindriya.co.uk/UserProfile/${userId}/${userProfile.name.replace(/\s+/g, '_')}`;
      userDetails.userProfile = userProfileUrl;
    }

    // Update myInterest and myInterestField if provided
    if (myInterest) {
console.log("----------------",myInterest)
      let interestArray = myInterest.split(',').map(Number); // Split the string into an array and convert to integers

      const validInterests = await Interest.findAll({ where: { id: interestArray } });
      if (validInterests.length !== interestArray.length) {
        return res.status(400).json({ message: 'Invalid interest IDs provided' });
      }

      const interestNames = validInterests.map(interest => interest.name); // Assuming the Interest model has a 'name' field
      userDetails.myInterest = interestArray;
      userDetails.myInterestField = interestNames;
    }

    await userDetails.save();
console.log("userDetails-------------",userDetails);
    res.status(200).json({ message: 'User details updated successfully', userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



//handleing the Leader Image and Video for verification


const userVerificationDir = '/etc/ec/data/UserVerification'; // Define the directory to store verification files

// Ensure the directory exists
if (!fs.existsSync(userVerificationDir)) {
    fs.mkdirSync(userVerificationDir, { recursive: true });
}

// Function to save files and return their paths
const saveFileverify = (file, userId, dir) => {
    const userDir = path.join(dir, userId.toString());
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }

    const filePath = path.join(userDir, `${file.name.replace(/\s+/g, '_')}`);
    fs.writeFileSync(filePath, file.data);
    return filePath;
};

exports.uploadVerificationFiles = async (req, res) => {
    const userId = req.params.id;
    const { verificationImage, verificationVideo } = req.files;

    try {
        const leaderVerify = await User.findOne({ where: { id: userId } });
        if (!leaderVerify) {
            return res.status(404).json({ message: 'User verification details not found' });
        }

        let verificationImageUrl = null;
        if (verificationImage) {
            const verificationImagePath = saveFileverify(verificationImage, userId, userVerificationDir);

            // Construct URL for verification image
            verificationImageUrl =`https://politiks.aindriya.co.uk/UserVerification/${userId}/${verificationImage.name.replace(/\s+/g, '_')}`;
        }

        let verificationVideoUrl = null;
        if (verificationVideo) {
            const verificationVideoPath = saveFileverify(verificationVideo, userId, userVerificationDir);

            // Construct URL for verification video
            verificationVideoUrl = `https://politiks.aindriya.co.uk/UserVerification/${userId}/${verificationVideo.name.replace(/\s+/g, '_')}`;
        }

        const leaderVerifyCreate = await LeaderVerify.create({
            userId,
            verificationImage: verificationImageUrl,
            verificationVideo: verificationVideoUrl
        });

        res.status(200).json({ message: 'Verification files uploaded successfully', leaderVerify: leaderVerifyCreate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getUserDetails = async (req, res) => {
  const userId = req.params.id;

  try {
    // Find user details by userId
    const userDetails = await UserDetails.findOne({
      where: { userId },
    });

    if (!userDetails) {
      return res.status(404).json({ message: 'User details not found' });
    }

    // Fetch fullname from User table
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['fullName'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch myParty details by name
    let myPartyData;
    try {
      myPartyData = await MyParty.findOne({
        where: { name: userDetails.myParty },
        attributes: ['icons', 'name'] // Add any other fields you need from myParty table
      });
    } catch (error) {
      console.warn('myParty details not found:', error);
    }

    // Fetch follower count
    const followerCount = await Follow.count({ where: { followingId: userId } });

    // Fetch following count
    const followingCount = await Follow.count({ where: { followerId: userId } });

    // Merge userDetails, user, and myParty data with follower and following counts
    const response = {
      ...userDetails.toJSON(),
      fullName: user.fullName,
      myParty: myPartyData ? myPartyData.toJSON() : null,
      followerCount,
      followingCount
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
/*
exports.getUserAllPostsByUserId = async (req, res) => {
console.log("get request from front end----------------");
  const userId = parseInt(req.params.id, 10); // Convert userId to an integer
console.log("userId-----------------",userId)
  if (isNaN(userId)) {
    // If userId is not a valid integer, return a 400 response
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    // Find all posts for the specified userId in descending order
    const posts = await Post.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']]
    });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for the user' });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/
exports.getUserAllPostsByUserId = async (req, res) => {
  console.log("get request from front end----------------");
  const userId = parseInt(req.params.id, 10); // Convert userId to an integer
  console.log("userId-----------------", userId);

  if (isNaN(userId)) {
    // If userId is not a valid integer, return a 400 response
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    // Find all posts for the specified userId in descending order
    const posts = await Post.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']]
    });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for the user' });
    }

    // Format the image URLs in each post
    const formattedPosts = posts.map(post => ({
      id: post.id,
      userId: post.userId,
      image: JSON.parse(post.image), // Parse the JSON string to convert it to an array
      location: post.location,
      tagUser: post.tagUser,
      caption: post.caption,
      likeCount: post.likeCount,
      video: post.video,
      originalPostId: post.originalPostId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getCountry = async (req,res)=>{
  try{
    const country = await Country.findAll();
    res.status(200).json(country);
  }catch(error){
    res.status(500).json({message:'Internal Server Error'})
  }
}



exports.getStates = async (req, res) => {
  try{
  const countryId = parseInt(req.params.id, 10);
  const state = await State.findAll({where:{countryId:countryId}})
  console.log(state)
  res.status(200).json(state)
  }catch(error){
    console.log(error);
    res.status(500).json({message:'Internal Server error'})

  }
};

exports.getAllMyParties = async (req, res) => {
  try {
      const myParties = await MyParty.findAll({ order: [['viewOrder', 'ASC']] });
      res.status(200).json(myParties);
  } catch (error) {
      console.error('Error fetching myParties:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

// exports.createComment = async (req, res) => {
//   const { userId, postId, content } = req.body;
// console.log("----------testing-------------",req.body);
//   try {
//       const newComment = await Comment.create({ userId, postId, content });
//       res.status(201).json({ message: 'Comment created successfully', comment: newComment });
//   } catch (error) {
//       console.error('Error creating comment:', error);
//       res.status(500).json({ message: 'Internal server error' });
//   }
// };

exports.createComment = async (req, res) => {
//return
  const { userId, postId, content } = req.body;
  console.log("----------testing-------------", req.body);
  
/*  try {
    // Create the new comment
    const newComment = await Comment.create({ userId, postId, content });
    console.log("New comment created:", newComment);

    // Retrieve the post details to get the userId of the post owner
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create a notification for the post owner
    const notification = await Notification.create({
      userId: post.userId,  // Notify the owner of the post
      postId,
      type: 'comment',
      content,
    });

    // Emit events to notify clients via Socket.io
    //req.io.emit('newComment', { postId, userId, content });

    // Emit event for new notification only to the post owner
    console.log('Emitting newNotification to user:', post.userId, notification);
    req.io.to(`user_${post.userId}`).emit('newCommentNotification', notification); // Emit to specific user

    res.status(201).json({ message: 'Comment created successfully', comment: newComment, notification });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }*/
try {
    // Create the new comment
    const newComment = await Comment.create({ userId, postId, content });
    console.log("New comment created:", newComment);

    // Retrieve the post details to get the userId of the post owner
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Retrieve the user details to get the userName and userProfile
    const user = await UserDetails.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Assign a dummy image URL if userProfile is null
    const userProfile = user.userProfile || 'https://i.postimg.cc/nc820Kz7/anandupic.png';

    // Format the notification content
    const formattedContent = `${user.userName} commented on your flare: ${content}. Thanks for the support`;

    // Determine the post image URL to use in the notification
    let postUrl = null; // Initialize postUrl
    if (Array.isArray(post.image) && post.image.length > 0) {
      postUrl = post.images[0]; // Use the first image URL from the array
    } else if (typeof post.image === 'string' && post.image !== '') {
      try {
        const parsedImages = JSON.parse(post.image);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          postUrl = parsedImages[0]; // Use the first image URL from the parsed array
        } else if (typeof parsedImages === 'string' && parsedImages !== '') {
          postUrl = parsedImages; // Use the parsed string as the URL
        }
      } catch (error) {
        console.error('Error parsing post images:', error);
        return res.status(500).json({ message: 'Error parsing post images' });
      }
    }
console.log("postUrl----------",postUrl);
    // Create a notification for the post owner
    const notification = await Notification.create({
      userId: post.userId,  // Notify the owner of the post
      postId,
      type: 'comment',
      content: formattedContent,
      userProfile: userProfile,
      post: postUrl,  // Use the determined post URL, can be null if not found
    });

    // Emit events to notify clients via Socket.io
    console.log('Emitting newNotification to user:', post.userId, notification);
    req.io.to(`user_${post.userId}`).emit('newCommentNotification', notification); // Emit to specific user

    res.status(201).json({ message: 'Comment created successfully', comment: newComment, notification });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

};


// exports.createComment = async (req, res) => {
//   const { userId, postId, content } = req.body;
//   console.log("----------testing-------------", req.body);
  
//   try {
//     // Create the new comment
//     const newComment = await Comment.create({ userId, postId, content });
//     console.log("New comment created:", newComment);

//     // Retrieve the post details to get the userId of the post owner
//     const post = await Post.findByPk(postId);
//     if (!post) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     // Retrieve the details of the user who made the comment
//     const commenter = await UserDetails.findByPk(userId, {
//       attributes: ['id', 'userName', 'userProfile']
//     });
//     if (!commenter) {
//       return res.status(404).json({ message: 'Commenter not found' });
//     }

//     // Retrieve the details of the post owner
//     const postOwner = await UserDetails.findByPk(post.userId, {
//       attributes: ['id', 'userName', 'userProfile']
//     });
//     if (!postOwner) {
//       return res.status(404).json({ message: 'Post owner not found' });
//     }

//     // Create a notification for the post owner
//     const notificationContent = `${commenter.userName} mentioned you in a comment: ${content}`;
//     const notification = await Notification.create({
//       userId: post.userId,  // Notify the owner of the post
//       postId,
//       type: 'comment',
//       content: notificationContent,
//     });

//     // Emit events to notify clients via Socket.io
//     req.io.emit('newComment', { postId, userId, content });

//     // Emit event for new notification only to the post owner
//     const notificationDetails = {
//       notification,
//       commenterDetails: {
//         userId: commenter.id,
//         userName: commenter.userName,
//         userProfile: commenter.userProfile
//       },
//       postOwnerDetails: {
//         userId: postOwner.id,
//         userName: postOwner.userName,
//         userProfile: postOwner.userProfile
//       }
//     };
//     console.log('Emitting newNotification to user:', post.userId, notificationDetails);
//     req.io.to(`user_${post.userId}`).emit('newNotification', notificationDetails); // Emit to specific user

//     res.status(201).json({ message: 'Comment created successfully', comment: newComment, notification });
//   } catch (error) {
//     console.error('Error creating comment:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


exports.updateComment = async (req, res) => {
  const id = req.params.commentId;
  const { content, userId } = req.body; // Assuming userId is passed in the request body
console.log("id-----------",id)
console.log("id-----------c",content)
console.log("id-----------u",userId)
  try {
    const comment = await Comment.findOne({where:{id:id}});
console.log("comment-----",comment)
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
console.log("comment.userId-------------------------",comment.userId);
console.log("userId-------------------",userId);

    // Check if the userId matches the userId of the comment
    if (comment.userId != userId) {
      return res.status(403).json({ message: 'You are not authorized to update this comment' });
    }

    if (content) {
      comment.content = content;
    }

    await comment.save();
console.log("-------------comment-------------",comment)
    res.status(200).json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.deleteComment = async (req, res) => {
  const { commentId, userId } = req.params;

  try {
    // Find the comment by ID
    const comment = await Comment.findByPk(commentId);

    // Check if the comment exists
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the userId matches the userId of the comment (authorization check)
    if (comment.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    // Find and delete all likes associated with the comment
    await CommentLike.destroy({ where: { commentId: commentId } });

    // Delete the comment
    await comment.destroy();

    res.status(200).json({ message: 'Comment and associated likes deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteSubComment = async (req, res) => {
  const { subCommentId, userId } = req.params;

  try {
    const subComment = await SubComment.findByPk(subCommentId);

    // Check if the sub-comment exists
    if (!subComment) {
      return res.status(404).json({ message: 'Sub-comment not found' });
    }

    // Check if the userId matches the userId of the sub-comment (authorization check)
    if (subComment.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ message: 'You are not authorized to delete this sub-comment' });
    }

    // Find and delete all likes associated with the sub-comment
    await SubCommentLike.destroy({ where: { subCommentId: subCommentId } });

    // Delete the sub-comment
    await subComment.destroy();

    res.status(200).json({ message: 'Sub-comment and associated likes deleted successfully' });
  } catch (error) {
    console.error('Error deleting sub-comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// controllers/subCommentController.js

exports.updateSubComment = async (req, res) => {
  const subCommentId = req.params.subCommentId;
  const { content, userId } = req.body; // Assuming content is passed in the request body

  try {
    const subComment = await SubComment.findOne({where:{id:subCommentId}});

    // Check if the sub-comment exists
    if (!subComment) {
      return res.status(404).json({ message: 'Sub-comment not found' });
    }

    // Check if the userId matches the userId of the sub-comment (authorization check)
    if (subComment.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ message: 'You are not authorized to update this sub-comment' });
    }

    if (content) {
      subComment.subComment = content;
    }

    await subComment.save();

    res.status(200).json({ message: 'Sub-comment updated successfully', subComment });
  } catch (error) {
    console.error('Error updating sub-comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCommentsByPostId = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.params.userId; // Assuming userId is passed in the request params
console.log("postId---------------------",postId);
console.log("userId-------------------------",userId);
  try {
    // Fetch comments by postId in descending order
    const comments = await Comment.findAll({
      where: { postId },
      order: [['createdAt', 'DESC']]
    });

    // Fetch subComments for those commentIds in descending order
    const commentIds = comments.map(comment => comment.id);
    const subComments = await SubComment.findAll({
      where: { commentId: commentIds },
      order: [['createdAt', 'DESC']]
    });

    // Extract unique userIds from comments and subComments
    const commentUserIds = [...new Set(comments.map(comment => comment.userId))];
    const subCommentUserIds = [...new Set(subComments.map(subComment => subComment.userId))];
    const allUserIds = [...new Set([...commentUserIds, ...subCommentUserIds])]; // Get unique userIds

    // Fetch user details for allUserIds
    const userDetails = await UserDetails.findAll({ where: { userId: allUserIds } });

    // Create a map of userId to userDetails with specific fields
    const userDetailsMap = userDetails.reduce((acc, userDetail) => {
      acc[userDetail.userId] = {
        id: userDetail.id,
        userId: userDetail.userId,
        role: userDetail.role,
        userName: userDetail.userName,
        userProfile: userDetail.userProfile,
      };
      return acc;
    }, {});

    // Fetch likes for comments
    const commentLikes = await CommentLike.findAll({ where: { commentId: commentIds } });
    const commentLikesMap = commentLikes.reduce((acc, like) => {
      if (!acc[like.commentId]) {
        acc[like.commentId] = {};
      }
      acc[like.commentId][like.userId] = true; // Set liked to true for comments liked by the user
      return acc;
    }, {});

    // Fetch likes for sub-comments
    const subCommentLikes = await SubCommentLike.findAll({ where: { subCommentId: subComments.map(sc => sc.id) } });
    const subCommentLikesMap = subCommentLikes.reduce((acc, like) => {
      if (!acc[like.subCommentId]) {
        acc[like.subCommentId] = {};
      }
      acc[like.subCommentId][like.userId] = true; // Set liked to true for sub-comments liked by the user
      return acc;
    }, {});

    // Create a map of commentId to subComments
    const subCommentsMap = subComments.reduce((acc, subComment) => {
      if (!acc[subComment.commentId]) {
        acc[subComment.commentId] = [];
      }
      const userDetail = userDetailsMap[subComment.userId] || {};
      acc[subComment.commentId].push({
        id: subComment.id,
        userId: subComment.userId,
        commentId: subComment.commentId,
        subComment: subComment.subComment,
        userDetails: {
          ...userDetail,
          commentedAt: new Date(subComment.createdAt).toLocaleTimeString()
        },
        liked: subCommentLikesMap[subComment.id] ? subCommentLikesMap[subComment.id][userId] || false : false, // Set liked flag based on subCommentLikesMap for the specific user
        likeCount: subCommentLikes.filter(like => like.subCommentId === subComment.id).length, // Count of likes for the sub-comment
        userSubCommented: subComment.userId === userId // Flag indicating if current user has sub-commented
      });
      return acc;
    }, {});

    // Attach user details and subComments to the comments
    const commentsWithUserDetailsAndSubComments = comments.map(comment => {
      const userDetail = userDetailsMap[comment.userId] || {};
      return {
        id: comment.id,
        userId: comment.userId,
        postId: comment.postId,
        content: comment.content,
        userDetails: {
          ...userDetail,
          commentedAt: new Date(comment.createdAt).toLocaleTimeString()
        },
        subComments: subCommentsMap[comment.id] || [],
        liked: commentLikesMap[comment.id] ? commentLikesMap[comment.id][userId] || false : false, // Set liked flag based on commentLikesMap for the specific user
        likeCount: commentLikes.filter(like => like.commentId === comment.id).length, // Count of likes for the comment
        userCommented: comment.userId === userId, // Flag indicating if current user has commented
      };
    });

    // Calculate counts
    const commentCount = comments.length;
    const subCommentCount = subComments.length;

    // Construct final response
    const response = {
      commentCount,
      subCommentCount,
      comments: commentsWithUserDetailsAndSubComments
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/*
  exports.createSubComment = async (req, res) => {
    const { userId, commentId, subComment } = req.body;

    try {
        const newSubComment = await SubComment.create({ userId, commentId, subComment });
  console.log("newSubComment---------",newSubComment)
        res.status(201).json({ message: 'SubComment created successfully', newSubComment });
    } catch (error) {
        console.error('Error creating subComment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  };
*/

exports.createSubComment = async (req, res) => {
  const { userId, commentId, subComment } = req.body;
  console.log("----------testing-------------", req.body);
  
  try {
    // Create the new sub-comment
    const newSubComment = await SubComment.create({ userId, commentId, subComment });
    console.log("New sub-comment created:", newSubComment);

    // Retrieve the comment details to get the userId of the comment owner
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const post = await Post.findByPk(comment.postId);
console.log("post----------------",post);
    const user = await UserDetails.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userProfile = user.userProfile || 'https://i.postimg.cc/nc820Kz7/anandupic.png';
    const formattedContent = `${user.userName} commented on your flare. Thanks for the support`;
    let postUrl = null; // Initialize postUrl
    if (Array.isArray(post.image) && post.image.length > 0) {
      postUrl = post.image[0]; // Use the first image URL from the array
    } else if (typeof post.image === 'string' && post.image !== '') {
      try {
        const parsedImages = JSON.parse(post.image);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          postUrl = parsedImages[0]; // Use the first image URL from the parsed array
        } else if (typeof parsedImages === 'string' && parsedImages !== '') {
          postUrl = parsedImages; // Use the parsed string as the URL
        }
      } catch (error) {
        console.error('Error parsing post images:', error);
        return res.status(500).json({ message: 'Error parsing post images' });
      }
    }
    // Create a notification for the comment owner
    const notification = await Notification.create({
      userId: comment.userId,  // Notify the owner of the comment
      postId: comment.postId,
      type: 'sub-comment',
      content: formattedContent,
      userProfile: userProfile,
      post: postUrl,
    });

    // Emit events to notify clients via Socket.io
    //req.io.emit('newSubComment', { commentId, userId, subComment });

    // Emit event for new notification only to the comment owner
    console.log('Emitting newSubCommentNotification to user:', comment.userId, notification);
    req.io.to(`user_${comment.userId}`).emit('newSubCommentNotification', notification); // Emit to specific user

    res.status(201).json({ message: 'Sub-comment created successfully', subComment: newSubComment, notification });
  } catch (error) {
    console.error('Error creating sub-comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/*
exports.likeComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { userId } = req.body;

  try {
    // Check if the user has already liked this comment
    const existingLike = await CommentLike.findOne({ where: { commentId, userId } });

    if (existingLike) {
      return res.status(400).json({ message: 'User has already liked this comment', liked: false });
    }

    // Create a new like entry
    await CommentLike.create({ commentId, userId });

    // Increment the like count
    const comment = await Comment.findByPk(commentId);
    comment.likeCount += 1;
    await comment.save();

    res.status(200).json({ message: 'Comment liked successfully', liked: true });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Internal server error', liked: false });
  }
};
*/

/*
exports.likeComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { userId } = req.body;
console.log("userId--------",userId)
console.log("commentId-------",commentId);
  try {
    // Check if the user has already liked this comment
    const existingLike = await CommentLike.findOne({ where: { commentId,userId } });
    console.log("existingLike--------",existingLike);
   

    if (existingLike) {
      return res.status(400).json({ message: 'User has already liked this comment', liked: false });
    }

    // Create a new like entry
    await CommentLike.create({ commentId, userId });

    // Increment the like count
    const comment = await Comment.findByPk(commentId);
    console.log("-----------------------",comment.userId);
    console.log("---------------------",comment.content);
    
    comment.likeCount += 1;
    await comment.save();

    // Retrieve the comment owner details
    const commentOwner = await User.findByPk(comment.userId);
    const liker = await UserDetail.findByPk(userId);

    // Create a notification for the comment owner
    const notificationContent = `${liker.userName} liked your comment: ${comment.content}`;
    const notification = await Notification.create({
      userId: comment.userId,  // Notify the owner of the comment
      postId: comment.postId,
      type: 'Comment like',
      content: notificationContent,
    });
// const notification="The data like here";
console.log("comment.userId--------",comment.userId);
    // Emit event for new like notification only to the comment owner
    // req.io.emit('newCommentLike', { postId, userId, notificationContent });
    console.log('Emitting newLikeNotification to user:', comment.userId, notification);
    req.io.to(`user_${comment.userId}`).emit('newCommentLikeNotification', notification); // Emit to specific user

    res.status(200).json({ message: 'Comment liked successfully', liked: true, notification });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Internal server error', liked: false });
  }
};
*/

exports.likeComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { userId } = req.body;

  try {
    // Check if the user has already liked this comment
    const existingLike = await CommentLike.findOne({ where: { commentId, userId } });

    if (existingLike) {
      return res.status(400).json({ message: 'User has already liked this comment', liked: false });
    }

    // Create a new like entry
    await CommentLike.create({ commentId, userId });

    // Increment the like count
    const comment = await Comment.findByPk(commentId);
    comment.likeCount += 1;
    await comment.save();
console.log("comment-----------",comment);

    // Retrieve the comment owner details
    const commentOwner = await User.findByPk(comment.userId);
    const liker = await UserDetails.findByPk(userId);
console.log("comment.post---------",comment.postId)
    // Retrieve the associated post details
    const post = await Post.findByPk(comment.postId);
console.log("post----------",post.image);
    // Create a notification for the comment owner
    const notificationContent = `${liker.userName} liked your comment: ${comment.content}`;
    const userProfile = commentOwner.userProfile || 'https://i.postimg.cc/nc820Kz7/anandupic.png';

let postUrl = null; // Initialize postUrl
    if (Array.isArray(post.image) && post.image.length > 0) {
      postUrl = post.images[0]; // Use the first image URL from the array
    } else if (typeof post.image === 'string' && post.image !== '') {
      try {
        const parsedImages = JSON.parse(post.image);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          postUrl = parsedImages[0]; // Use the first image URL from the parsed array
        } else if (typeof parsedImages === 'string' && parsedImages !== '') {
          postUrl = parsedImages; // Use the parsed string as the URL
        }
      } catch (error) {
        console.error('Error parsing post images:', error);
        return res.status(500).json({ message: 'Error parsing post images' });
      }
    }
    const notification = await Notification.create({
      userId: comment.userId,  // Notify the owner of the comment
      postId: comment.postId,
      type: 'Comment like',
      content: notificationContent,
      userProfile: userProfile,
      post: postUrl,
    });

    // Emit event for new like notification only to the comment owner
    console.log('Emitting newLikeNotification to user:', comment.userId, notification);
    req.io.to(`user_${comment.userId}`).emit('newCommentLikeNotification', notification); // Emit to specific user

    res.status(200).json({ message: 'Comment liked successfully', liked: true, notification });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Internal server error', liked: false });
  }
};


exports.unlikeComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { userId } = req.body;

  try {
    // Check if the like entry exists
    const existingLike = await CommentLike.findOne({ where: { commentId, userId } });

    if (!existingLike) {
      return res.status(400).json({ message: 'User has not liked this comment', unliked: false });
    }

    // Remove the like entry
    await CommentLike.destroy({ where: { commentId, userId } });

    // Decrement the like count
    const comment = await Comment.findByPk(commentId);
    comment.likeCount -= 1;
    await comment.save();

    res.status(200).json({ message: 'Comment unliked successfully', unliked: true });
  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ message: 'Internal server error', unliked: false });
  }
};
/*
exports.likeSubComment = async (req, res) => {
  const  subCommentId = req.params.commentId;
  const { userId } = req.body;

  try {
    // Check if the user has already liked this sub-comment
    const existingLike = await SubCommentLike.findOne({ where: { subCommentId, userId } });

    if (existingLike) {
      return res.status(400).json({ message: 'User has already liked this sub-comment' });
    }

    // Create a new like entry
    await SubCommentLike.create({ subCommentId, userId });

    // Increment the like count
    const subComment = await SubComment.findByPk(subCommentId);
    subComment.likeCount += 1;
    await subComment.save();

    res.status(200).json({ message: 'Sub-comment liked successfully' });
  } catch (error) {
    console.error('Error liking sub-comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

};*/
exports.likeSubComment = async (req, res) => {
  const subCommentId = req.params.commentId;
  const { userId } = req.body;

  try {
    // Check if the user has already liked this sub-comment
    const existingLike = await SubCommentLike.findOne({ where: { subCommentId, userId } });

    if (existingLike) {
      return res.status(400).json({ message: 'User has already liked this sub-comment' });
    }

    // Create a new like entry
    await SubCommentLike.create({ subCommentId, userId });

    // Increment the like count
    const subComment = await SubComment.findByPk(subCommentId);
    subComment.likeCount += 1;
    await subComment.save();
const commentId=subComment.commentId;
const comment= await Comment.findByPk(commentId);


const user = await UserDetails.findByPk(userId);
const userProfile = user.userProfile || 'https://i.postimg.cc/nc820Kz7/anandupic.png';
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const post = await Post.findByPk(comment.postId);
console.log("post----------------",post);
//    const user = await UserDetails.findByPk(userId);
  //  if (!user) {
    //  return res.status(404).json({ message: 'User not found' });
    //}
//    const userProfile = user.userProfile || 'https://i.postimg.cc/nc820Kz7/anandupic.png';
    const formattedContent = `${user.userName} commented on your flare. Thanks for the support`;
    let postUrl = null; // Initialize postUrl
    if (Array.isArray(post.image) && post.image.length > 0) {
      postUrl = post.image[0]; // Use the first image URL from the array
    } else if (typeof post.image === 'string' && post.image !== '') {
      try {
        const parsedImages = JSON.parse(post.image);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          postUrl = parsedImages[0]; // Use the first image URL from the parsed array
        } else if (typeof parsedImages === 'string' && parsedImages !== '') {
          postUrl = parsedImages; // Use the parsed string as the URL
        }
      } catch (error) {
        console.error('Error parsing post images:', error);
        return res.status(500).json({ message: 'Error parsing post images' });
      }
    }

// return
    // Retrieve the sub-comment owner details
    const subCommentOwner = await User.findByPk(subComment.userId);
    const liker = await User.findByPk(userId);

    // Create a notification for the sub-comment owner
    const notificationContent = `${liker.fullName} liked your sub-comment: ${subComment.subComment}`;
    const notification = await Notification.create({
      userId: subComment.userId,  // Notify the owner of the sub-comment
      postId:comment.postId,
      type: 'like',
      content: notificationContent,
      userProfile: userProfile,
      post: postUrl,
    });
    // Emit event for new like notification only to the sub-comment owner
    //console.log('Emitting newLikeSubCommentNotification to user:', subComment.userId, notification);
    req.io.to(`user_${subComment.userId}`).emit('newLikeSubCommentNotification', notification); // Emit to specific user

    res.status(200).json({ message: 'Sub-comment liked successfully', notification });
  } catch (error) {
    console.error('Error liking sub-comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.unlikeSubComment = async (req, res) => {
  const subCommentId = req.params.subCommentId; // Corrected parameter name
  const { userId } = req.body;
console.log("req.params.subCommentId---------------",req.params.subCommentId)
console.log("subCommentId----------------",subCommentId);
console.log("req.body------------------",req.body);

  try {
    // Check if the like entry exists
    const existingLike = await SubCommentLike.findOne({ where: { subCommentId, userId } });

    if (!existingLike) {
      return res.status(400).json({ message: 'User has not liked this sub-comment', unliked: false });
    }

    // Remove the like entry
    await SubCommentLike.destroy({ where: { subCommentId, userId } });

    // Decrement the like count
    const subComment = await SubComment.findByPk(subCommentId);
    subComment.likeCount -= 1;
    await subComment.save();

    res.status(200).json({ message: 'Sub-comment unliked successfully', unliked: true });
  } catch (error) {
    console.error('Error unliking sub-comment:', error);
    res.status(500).json({ message: 'Internal server error', unliked: false });
  }
};

/*
exports.followUser = async (req, res) => {
  const userId = req.params.userId;
  const { followerId } = req.body;

  try {
    const user = await User.findByPk(userId);
    const follower = await User.findByPk(followerId);

	    if (!user || !follower) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Follow.create({ followerId, followingId: userId });

    res.status(201).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/

/*
exports.followUser = async (req, res) => {
  const userId = req.params.userId;
  const { followerId } = req.body;
console.log("req.body-----------",req.body)
  try {
    const user = await User.findByPk(userId);
    const follower = await UserDetails.findAll({where:{userId:followerId}});

    console.log("follower-----------",follower);
    // return
    
    console.log("follower.userName-----------",follower[0].userName);
    

    if (!user || !follower) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Follow.create({ followerId, followingId: userId });

    // Create a notification for the followed user
    const notificationContent = `${follower[0].userName} started following you.`;
    const notification = await Notification.create({
      userId,  // Notify the followed user
      postId:0,
      type: 'following',
      content: notificationContent,
    });

    // Emit event for new follow notification only to the followed user
    console.log('Emitting newFollowNotification to user:', userId, notification);
    req.io.to(`user_${userId}`).emit('newFollowNotification', notification); // Emit to specific user

    res.status(201).json({ message: 'User followed successfully', notification });
console.log("notification-------------",notification)
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/
exports.followUser = async (req, res) => {
  const userId = req.params.userId;
  const { followerId } = req.body;

  try {
    const user = await User.findByPk(userId);
    const follower = await UserDetails.findOne({ where: { userId: followerId } });

    if (!user || !follower) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the follow relationship already exists
    const existingFollow = await Follow.findOne({ where: { followerId, followingId: userId } });

    if (existingFollow) {
      return res.status(400).json({ message: 'User is already followed' });
    }

    await Follow.create({ followerId, followingId: userId });
const postUrl =  await UserDetails.findOne({where:{userId:followerId}})
const userProfile =await UserDetails.findOne({where:{userId}})
    // Create a notification for the followed user
    const notificationContent = `${follower.userName} started following you.`;
    const notification = await Notification.create({
      userId,  // Notify the followed user
      postId: 0,
      type: 'following',
      content: notificationContent,
      userProfile: userProfile.userProfile,
      post: postUrl.userProfile,
    });

    // Emit event for new follow notification only to the followed user
    req.io.to(`user_${followerId}`).emit('newFollowNotification', notification); // Emit to specific user

    res.status(201).json({ message: 'User followed successfully', notification });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.unfollowUser = async (req, res) => {
  const userId = req.params.userId;
  const { followerId } = req.body;

  try {
    const follow = await Follow.findOne({ where: { followerId, followingId: userId } });

    if (!follow) {
      return res.status(404).json({ message: 'Follow relationship not found' });
    }

    await follow.destroy();

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getFollowers = async (req, res) => {
  const userId = req.params.userId;
  console.log("userId----------------getFollower", userId);

  try {
    // Fetch all followers where the followingId is the userId
    const followers = await Follow.findAll({ where: { followingId: userId } });

    // Map the followerIds from the followers data
    const followerIds = followers.map(follow => follow.followerId);

    // Fetch the details of the followers
    const followerDetails = await UserDetails.findAll({ where: { userId: followerIds } });

    // Calculate the count of followers
    const followerCount = followerDetails.length;

    // Create the response object including the follower count
    const response = {
      followerCount,
      followerDetails
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getFollowing = async (req, res) => {
  const userId = req.params.userId;
console.log("userId-------------",userId)
  try {
    // Fetch all followings
    const followings = await Follow.findAll({ where: { followerId: userId } });
console.log("following count--------------",followings.length)
    // Map to extract following IDs
    const followingIds = followings.map(follow => follow.followingId);
console.log("followingIds------------------",followingIds);
    // Fetch details of all users being followed
    const followingDetails = await UserDetails.findAll({ where: { id: followingIds } });

    // Get the count of followings
    const followingCount = followingDetails.length;

    // Create a list with additional count field for each user
    const followingList = followingDetails.map((userDetail, index) => {
      return {
        ...userDetail.toJSON(),
        count: index + 1 // Add a count field for each user
      };
    });

    res.status(200).json({
      count: followings.length,
      followings: followingList
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/*
exports.suggestions = async (req, res) => {
  const { userId } = req.params;

  console.log("userId----------", userId);

  try {
    // Fetch the user details by userId to get the state
    const userDetails = await UserDetails.findOne({
      where: { userId },
      attributes: ['state']
    });

    if (!userDetails) {
      return res.status(404).json({ message: 'User details not found' });
    }

    const location = userDetails.state;
    console.log("location-------", location);

    // Fetch newly joined users
    const newUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Fetch location-based users
    let locationUsers = [];
    if (location) {
      // Fetch user IDs based on the state
      const locationUserDetails = await UserDetails.findAll({
        where: { state: location },
        attributes: ['userId']
      });

      const locationUserIds = locationUserDetails.map(detail => detail.userId);

      locationUsers = await User.findAll({
        where: {
          id: locationUserIds
        },
        order: [['createdAt', 'DESC']],
        limit: 10
      });
    }

    // Fetch follower counts and user details for new users and location-based users
    const fetchUserDetailsAndFollowerCount = async (users) => {
      const usersWithDetails = await Promise.all(users.map(async user => {
        const followerCount = await Follow.count({ where: { followingId: user.id } });
        const userDetails = await UserDetails.findOne({
          where: { userId: user.id }
        });
        const isFollowing = await Follow.findOne({ where: { followerId: userId, followingId: user.id } });
        return {
          ...user.toJSON(),
          followerCount,
          userDetails,
          userFollowing: !!isFollowing // Convert to boolean
        };
      }));
      return usersWithDetails;
    };

    const newUsersWithDetails = await fetchUserDetailsAndFollowerCount(newUsers);
    const locationUsersWithDetails = await fetchUserDetailsAndFollowerCount(locationUsers);

    // Combine both results
    const suggestions = {
      newUsers: newUsersWithDetails,
      locationUsers: locationUsersWithDetails
    };

    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/


exports.suggestions = async (req, res) => {
  const { userId } = req.params;
console.log("userId--------------",userId)
  try {
    // Fetch the user details by userId to get the state
    const userDetails = await UserDetails.findOne({
      where: { userId },
      attributes: ['state']
    });

    if (!userDetails) {
      return res.status(404).json({ message: 'User details not found' });
    }

    const location = userDetails.state;

    // Fetch newly joined users
    const newUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Fetch location-based users
    let locationUsers = [];
    if (location) {
      const locationUserDetails = await UserDetails.findAll({
        where: { state: location },
        attributes: ['userId']
      });

      const locationUserIds = locationUserDetails.map(detail => detail.userId);

      locationUsers = await User.findAll({
        where: {
          id: locationUserIds
        },
        order: [['createdAt', 'DESC']],
        limit: 10
      });
    }

    // Fetch follower counts and user details for new users and location-based users
    const fetchUserDetailsAndFollowerCount = async (users) => {
      const usersWithDetails = await Promise.all(users.map(async user => {
        const followerCount = await Follow.count({ where: { followingId: user.id } });
        const userDetails = await UserDetails.findOne({
          where: { userId: user.id }
        });

        // Check if the current user is following this user
        const isFollowing = await Follow.findOne({ 
          where: { 
            followerId: user.id,
            followingId: userId
          } 
        });

        return {
          ...user.toJSON(),
          followerCount,
          userDetails,
          following: !!isFollowing // Convert to boolean
        };
      }));
      return usersWithDetails;
    };

    const newUsersWithDetails = await fetchUserDetailsAndFollowerCount(newUsers);
    const locationUsersWithDetails = await fetchUserDetailsAndFollowerCount(locationUsers);

    // Combine both results
    const suggestions = {
      newUsers: newUsersWithDetails,
      locationUsers: locationUsersWithDetails
    };

    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/*
exports.likeUnlikePost = async (req, res) => {
  const postId = req.params.postId;
  const { userId } = req.body;

  try {
      // Check if the user has already liked the post
      const existingLike = await PostLike.findOne({
          where: {
              postId,
              userId
          }
      });
      if (existingLike) {
          // Unlike the post if already liked
          await PostLike.destroy({
              where: {
                  postId,
                  userId
              }
          });

          // Decrease likeCount in Post table
          await Post.decrement('likeCount', {
              where: { id: postId },
              by: 1
          });

          res.status(200).json({ message: 'Post unliked successfully' });
      } else {
          // Like the post if not already liked
          await PostLike.create({
              postId,
              userId
          });

          // Increase likeCount in Post table
          await Post.increment('likeCount', {
              where: { id: postId },
              by: 1
          });

          res.status(201).json({ message: 'Post liked successfully' });
      }
  } catch (error) {
      console.error('Error liking/unliking post:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};
*/

exports.likeUnlikePost = async (req, res) => {
  const postId = req.params.postId;
  const { userId } = req.body;
console.log("userId------------",userId)
  try {
    // Check if the user has already liked the post
    const existingLike = await PostLike.findOne({
      where: {
        postId,
        userId
      }
    });
    
    if (existingLike) {
      // Unlike the post if already liked
      await PostLike.destroy({
        where: {
          postId,
          userId
        }
      });

      // Decrease likeCount in Post table
      await Post.decrement('likeCount', {
        where: { id: postId },
        by: 1
      });

      res.status(200).json({ message: 'Post unliked successfully' });
    } else {
      // Like the post if not already liked
      await PostLike.create({
        postId,
        userId
      });

      // Increase likeCount in Post table
      await Post.increment('likeCount', {
        where: { id: postId },
        by: 1
      });

      // Fetch post to get the userId of the post owner
      const post = await Post.findByPk(postId);
const user = await UserDetails.findByPk(userId);
const userProfile = user.userProfile || 'https://i.postimg.cc/nc820Kz7/anandupic.png';

      let postUrl = null; // Initialize postUrl
    if (Array.isArray(post.image) && post.image.length > 0) {
      postUrl = post.images[0]; // Use the first image URL from the array
    } else if (typeof post.image === 'string' && post.image !== '') {
      try {
        const parsedImages = JSON.parse(post.image);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          postUrl = parsedImages[0]; // Use the first image URL from the parsed array
        } else if (typeof parsedImages === 'string' && parsedImages !== '') {
          postUrl = parsedImages; // Use the parsed string as the URL
        }
      } catch (error) {
        console.error('Error parsing post images:', error);
        return res.status(500).json({ message: 'Error parsing post images' });
      }
    }
      if (post) {
const formattedContent = `${user.userName} liked your Photo.`;
        // Create a notification (mocked for this example)
        const notification = {
          userId: post.userId,  // Notify the owner of the post
          postId,
          type: 'like',
          content: formattedContent,
          post: postUrl,
          userProfile: userProfile
        };

        //req.io.emit('existingLike', { postId, userId });

        // Emit notification to the post owner
        req.io.to(`user_${post.userId}`).emit('postLikeNotification', notification);
      }

      res.status(201).json({ message: 'Post liked successfully' });
    }
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.likedUserList = async(req,res)=>{
  const postId = req.params.postId;
  try {
    // Find the post
    const post = await Post.findByPk(postId);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    // Fetch liked users for the post from UserDetails
    const likedUsers = await PostLike.findAll({
        where: { postId }
    });

    // Map liked users to UserDetails
    const usersPromises = likedUsers.map(async (like) => {
        const userDetails = await UserDetails.findOne({
            where: { userId: like.userId },
            attributes: ['userId', 'userName', 'userProfile']
        });
        return userDetails;
    });

    // Execute all promises concurrently
    const users = await Promise.all(usersPromises);

    res.status(200).json(users);
} catch (error) {
    console.error('Error fetching liked users:', error);
    res.status(500).json({ message: 'Internal server error' });
}
}


exports.createRepost = async (req, res) => {
  const postId = req.params.postId;
  const { userId, caption, tagUser, location } = req.body;

  try {
    // Check if the original post exists
    const originalPost = await Post.findByPk(postId);
    if (!originalPost) {
      return res.status(404).json({ message: 'Original post not found' });
    }

    // Ensure image URLs are properly formatted and parsed as an array
    let imageUrls;
    try {
      imageUrls = JSON.parse(originalPost.image);
      if (!Array.isArray(imageUrls)) {
        imageUrls = [imageUrls];
      }
    } catch (error) {
      imageUrls = [originalPost.image.replace(/^"|"$/g, '')];
    }

    // Create a new post with the new details or fallback to original post details
    const newPost = await Post.create({
      userId,
      image: imageUrls,
      video: originalPost.video, // Store image as an array
      location: location || originalPost.location,
      tagUser: tagUser || originalPost.tagUser,
      caption: caption || originalPost.caption,
      originalPostId: postId
    });

    res.status(201).json({ message: 'Post reposted successfully', newPost });
  } catch (error) {
    console.error('Error reposting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const saveVideo = (file, userId) => {
  const userDir = path.join('/etc/ec/data/reels', userId.toString());
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const filePath = path.join(userDir, file.name.replace(/\s+/g, '_'));
  fs.writeFileSync(filePath, file.data);
  return filePath;
};

exports.createReel = async (req, res) => {
  const { tagUser, caption, location } = req.body;
  const userId = req.params.userId;
  const videos = req.files && req.files.video;

  try {
    const reel = await Reel.create({ userId, location, tagUser, caption });

    if (videos) {
      const videoUrls = [];

      if (Array.isArray(videos)) {
        // Handle multiple videos
        videos.forEach(video => {
          const videoPath = saveVideo(video, userId);
          const videoUrl = `https://politiks.aindriya.co.uk/reels/${userId}/${path.basename(videoPath)}`;
          videoUrls.push(videoUrl);
        });
      } else {
        // Handle single video
        const videoPath = saveVideo(videos, userId);
        const videoUrl = `https://politiks.aindriya.co.uk/reels/${userId}/${path.basename(videoPath)}`;
        videoUrls.push(videoUrl);
      }

      // Save video URLs in the Reel model
      reel.video = videoUrls.join(','); // Store as a comma-separated string if multiple videos
      await reel.save();
    }

    res.status(201).json({ message: 'Reel created successfully', reel });
  } catch (error) {
    console.error('Error creating reel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



exports.updateReel = async (req, res) => {
  const reelId = req.params.reelId;
  const { tagUser, caption, location } = req.body;

  try {
    const reel = await Reel.findByPk(reelId);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    reel.caption = caption || reel.caption;
    reel.location = location || reel.location;
    reel.tagUser = tagUser || reel.tagUser;

    await reel.save();
    res.status(200).json({ message: 'Reel updated successfully', reel });
  } catch (error) {
    console.error('Error updating reel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/*
exports.getReelByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const reels = await Reel.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    res.status(200).json(reels);
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
*/

exports.getReelByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch user details for the given userId
    const userDetails = await UserDetails.findOne({ where: { userId } });
    if (!userDetails) {
      return res.status(404).json({ message: 'User details not found' });
    }

    // Fetch reels for the given userId
    const reels = await Reel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    // Combine the reels and userDetails into the response object
    const response = {
      userDetails,
      reels
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteReel = async (req, res) => {
  const reelId = req.params.reelId;

  try {
    const reel = await Reel.findByPk(reelId);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    await reel.destroy();
    res.status(200).json({ message: 'Reel deleted successfully' });
  } catch (error) {
    console.error('Error deleting reel:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getAllReels = async (req, res) => {
  try {
    // Fetch all reels in descending order of creation time
    const reels = await Reel.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Extract unique userIds from reels
    const userIds = [...new Set(reels.map(reel => reel.userId))];

    // Fetch user details for the unique userIds
    const userDetails = await UserDetails.findAll({
      where: {
        userId: userIds
      },
      attributes: ['id', 'userId', 'role', 'userName', 'userProfile']
    });

    // Create a map of userId to userDetails
    const userDetailsMap = userDetails.reduce((acc, userDetail) => {
      acc[userDetail.userId] = userDetail;
      return acc;
    }, {});

    // Attach userDetails to each reel
    const reelsWithUserDetails = reels.map(reel => {
      return {
        ...reel.dataValues,
        userDetails: userDetailsMap[reel.userId] || {}
      };
    });

    // Respond with the list of reels with user details
    res.status(200).json(reelsWithUserDetails);
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getShareFollowerList = async (req, res) => {
  const userId = req.params.userId;
  const { name } = req.query; // Get the name from the query parameters

  try {
    // Fetch followers of the user
    const followers = await Follow.findAll({
      where: { followingId: userId },
      attributes: ['followerId']
    });

    // Extract followerIds
    const followerIds = followers.map(f => f.followerId);

    // Build the where condition based on the presence of the name query parameter
    const whereCondition = { userId: followerIds };
    if (name) {
      whereCondition.userName = { [Sequelize.Op.like]: `%${name}%` };
    }

    // Fetch user details for these followerIds with optional name filtering
    const followerDetails = await UserDetails.findAll({
      where: whereCondition,
      attributes: ['id', 'userId', 'role', 'userName', 'userProfile'],
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(followerDetails);
  } catch (error) {
    console.error('Error fetching follower list:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



/*
exports.searchUsers = async (req, res) => {
  const { name, location } = req.query;

  if (!name && !location) {
    return res.status(400).json({ message: 'Please provide a search parameter: name or location' });
  }

  try {
    let searchCriteria = {};

    if (name) {
      searchCriteria.userName = {
        [Op.like]: `%${name}%`
      };
    }

    if (location) {
      searchCriteria.state = {
        [Op.like]: `%${location}%`
      };
    }

    const users = await UserDetails.findAll({
      where: searchCriteria,
      attributes: ['id', 'userId', 'userName', 'state', 'userProfile', 'role']
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/


exports.searchUsers = async (req, res) => {
  const { name, location } = req.query;

  if (!name && !location) {
    return res.status(400).json({ message: 'Please provide a search parameter: name or location' });
  }

  try {
    let searchCriteria = {};

    if (name) {
      searchCriteria.userName = {
        [Op.like]: `%${name}%`
      };
    } else if (location) {
      searchCriteria.state = {
        [Op.like]: `%${location}%`
      };
    }

    const users = await UserDetails.findAll({
      where: searchCriteria,
      attributes: ['id', 'userId', 'userName', 'state', 'userProfile', 'role']
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId; // Get userId from headers
console.log("userId--------------",userId)
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
