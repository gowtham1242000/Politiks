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

const Country = require('../models/Country');
const State = require('../models/State');
const MyParty = require('../models/MyParty');
const Comment = require('../models/Comment');
const SubComment = require('../models/SubComment');

const CommentLike = require('../models/CommentLike');
const SubCommentLike = require('../models/SubCommentLike');




const { generateOTP, sendOTP } = require('../middleware/otpService');

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key_12345';
const {Sequelize} =require('sequelize')

// Ensure your function is declared as an async function
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
     
  else {
      // Normal registration flow with email and password
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        const userDetails = await UserDetails.findOne({ where: { userId: existingUser.id } });
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

// exports.goToHome = async (req, res) => {
//   const userId = req.params.id; // Correctly access userId from req.params

//   try {
//       const user = await User.findOne({ where: { id: userId } });

//       if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//       }

//       // Assuming you have a method to validate password
//       // if (!user.validPassword(user.password)) {
//       //     return res.status(401).json({ message: 'Invalid password' });
//       // }

//       const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
//       user.token = token;
//       await user.save();

//       res.status(200).json({ message: 'Login successful', token, user });
//   } catch (error) {
//       console.error('Error finding user:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

exports.goToHome = async (req, res) => {
  const userId = req.params.id;

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

// Get user details
/*
exports.getUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
*/
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

//handle followers and following

  //   exports.following = async(req,res) =>{
  //       console.log("req.body-------",req.body)
  //   const {followerId } = req.body;

  //   const userId = req.params.id;
  
  //   try {
  //     // Create a new following relationship
  //     const newFollowing = await Following.create({ userId, followerId });
  
  //     res.status(201).json({ message: 'User followed successfully', following: newFollowing });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'Internal Server Error' });
  //   }
  // };

/*
exports.getFollowingList = async (req, res) => {
  const userId = req.params.id; // Assuming userId is passed in the headers

  try {
    // Find all entries in Following table where userId matches the provided userId
    const followingList = await Following.findAll({
      where: {
        userId: userId,
      },
      attributes: ['followerId'], // Specify the attributes you want to retrieve
    });

    if (!followingList) {
      return res.status(404).json({ message: 'No following found for the user' });
    }

    // Extract followerIds from followingList
    const followerIds = followingList.map(entry => entry.followerId);

    res.json({ followingList: followerIds });
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/

// exports.getFollowingList = async (req, res) => {
//   const userId = req.params.id; // Assuming userId is passed in the headers

//   try {
//     // Find all entries in Following table where userId matches the provided userId
//     const followingList = await Following.findAll({
//       where: {
//         userId: userId,
//       },
//       attributes: ['followerId'], // Specify the attributes you want to retrieve
//     });

//     if (!followingList) {
//       return res.status(404).json({ message: 'No following found for the user' });
//     }

//     // Extract followerIds from followingList
//     const followerIds = followingList.map(entry => entry.followerId);

//     // Count the number of followers for each user
//     const followerCount = await Following.count({
//       where: {
//         userId: userId,
//       },
//     });

//     res.json({ followingList: followerIds, followerCount: followerCount });
//   } catch (error) {
//     console.error('Error fetching following list:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
  
//   const saveImage = (file, userId) => {
//     const userDir = path.join('/etc/ec/data/post', userId.toString());
//     if (!fs.existsSync(userDir)) {
//       fs.mkdirSync(userDir, { recursive: true });
//     }
  
//     const filePath = path.join(userDir, file.name.replace(/\s+/g, '_'));
//     fs.writeFileSync(filePath, file.data);
//     return filePath;
//   };
  
  exports.createPost = async (req, res) => {
    const { tagUser, caption, location } = req.body;
    const userId = req.params.id;
    const image = req.files && req.files.image;
    //const location =location;

  console.log("image---------------",image)
    try {
      const post = await Post.create({ userId, location, tagUser, caption });
console.log("post-----",post)  
      if (image && image.name && image.data) {
        const imagePath = saveImage(image, userId);
  
        // Construct the URL for the image
        const imageUrl = `https://politiks.aindriya.co.uk/post/${userId}/${image.name.replace(/\s+/g, '_')}`;
        post.image = imageUrl;
        await post.save();
      } else {
        console.error('Invalid image file:', image);
      }
  
      res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

/*exports.getAllPost =async (req,res)=>{
    try{

        const post =await Post.findAll();
        console.log("post--------",post);
        res.status(200).json(post)

    }catch(error){
        res.status(500).json({message:'Internal server Error'})
    }
  }
*/

/*exports.getAllPost = async (req, res) => {
  try {
    // Find all posts in descending order
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']] // Adjust the column name if necessary
    });

    console.log("posts--------", posts);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};*/
/*
exports.getAllPost = async (req, res) => {
    try {
      // Step 1: Fetch all posts in descending order of createdAt
      const posts = await Post.findAll({
        order: [['createdAt', 'DESC']],
      });
  
      // Step 2: Extract userIds from posts
      const userIds = posts.map(post => post.userId);
  
      // Step 3: Fetch user details for the extracted userIds
      const userDetails = await UserDetails.findAll({
        where: { userId: userIds },
        attributes: ['userId', 'userName', 'country'] // Adjust attributes as needed
      });
  
      // Step 4: Combine posts and user details into a single response
      const postsWithUserDetails = posts.map(post => {
        const userDetail = userDetails.find(detail => detail.userId === post.userId);
        return {
          id: post.id,
          userId: post.userId,
          image: post.image,
          location: post.location,
          tagUser: post.tagUser,
          caption: post.caption,
          userDetails: userDetail // Attach user details to each post
        };
      });
  
      res.status(200).json(postsWithUserDetails);
    } catch (error) {
      console.error('Error fetching posts with user details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
*/

exports.getAllPost = async (req, res) => {
  try {
    // Step 1: Fetch all posts in descending order of createdAt
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
    });

    // Step 2: Extract userIds from posts
    const userIds = posts.map(post => post.userId);

    // Step 3: Fetch user details for the extracted userIds
    const userDetails = await UserDetails.findAll({
      where: { userId: userIds },
    });

    // Step 4: Combine posts and user details into a single response
    const postsWithUserDetails = posts.map(post => {
      const userDetail = userDetails.find(detail => detail.userId === post.userId);
      return {
        id: post.id,
        userId: post.userId,
        image: post.image,
        location: post.location,
        tagUser: post.tagUser,
        caption: post.caption,
        userDetails: userDetail // Attach user details to each post
      };
    });

    res.status(200).json(postsWithUserDetails);
  } catch (error) {
    console.error('Error fetching posts with user details:', error);
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

/*exports.getAllPost = async (req, res) => {
  try {
    // Fetch all posts along with user details
    const posts = await Post.findAll({
      include: [{
        model: UserDetails,
        attributes: ['id', 'userName', 'role', 'dateOfBirth', 'gender', 'country', 'state', 'status', 'action', 'mySelf', 'userBannerProfile', 'userProfile', 'myParty', 'myInterest', 'mailId'], // Specify the attributes you want to retrieve from UserDetails
      }],
    });

    console.log("posts--------", posts);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};*/
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

/*exports.updateUserDetails = async (req, res) => {
    const { userName, dateOfBirth, gender, country, state, mySelf, myParty, myInterest } = req.body;
   // console.log("req.body----------",req.body)
    const userId = req.params.id;
console.log("req.body------------------*************________________----------",req.body);
console.log("userId======================",userId)
console.log("myInterest-------------",myInterest)
//return
    try {
        const userDetails = await UserDetails.findOne({ where: { userId } });
console.log("userDetails--------------",userDetails);
//return
        if (!userDetails) {
            return res.status(404).json({ message: 'User details not found' });
        }

        // Only update the fields that are provided
        if (userName) userDetails.userName = userName;
        //if (role) userDetails.role = role;
        if (dateOfBirth) userDetails.dateOfBirth = dateOfBirth;
        if (gender) userDetails.gender = gender;
        if (country) userDetails.country = country;
        if (state) userDetails.state = state;
        if (mySelf) userDetails.mySelf = mySelf;
        if (myParty) userDetails.myParty = myParty;
        //if (myInterest) userDetails.myInterest =myInterest;
         //if(myInterest) userDetails.myInterest = myInterest;

        // Update status based on role
       // userDetails.status = (role === 'Follower') ? true : false;

        // Save profile banner if provided
        if (req.files && req.files.userBannerProfile) {
            const userBannerProfile = req.files.userBannerProfile;
            const userBannerProfilePath = saveImages(userBannerProfile, userId, userBannerDir);

            // Construct the URL for the banner
            const userBannerProfileUrl = `https://politiks.aindriya.co.uk/UserBanner/${userId}/${userBannerProfile.name.replace(/\s+/g, '_')}`;
            userDetails.userBannerProfile = userBannerProfileUrl;
        }

        // Save profile image if provided
        if (req.files && req.files.userProfile) {
            const userProfile = req.files.userProfile;
            const userProfilePath = saveImages(userProfile, userId, userProfileDir);

            // Construct the URL for the profile image
            const userProfileUrl = `https://politiks.aindriya.co.uk/UserProfile/${userId}/${userProfile.name.replace(/\s+/g, '_')}`;
            userDetails.userProfile = userProfileUrl;
        }

        // Update myInterest if provided
        if (myInterest) {
          let interestArray = [];
          try {
            interestArray = JSON.parse(myInterest);
          } catch (error) {
            return res.status(400).json({ message: 'Invalid format for myInterest' });
          }
    
          const validInterests = await Interest.findAll({ where: { id: interestArray } });
          if (validInterests.length !== interestArray.length) {
            return res.status(400).json({ message: 'Invalid interest IDs provided' });
          }
    
         // await UserInterest.destroy({ where: { userDetailsId: userDetails.id } }); // Remove old interests
          //await Promise.all(validInterests.map(interest => {
          //   return UserInterest.create({
          //     userDetailsId: userDetails.id,
          //     interestId: interest.id
          //   });
          // }));
    
          userDetails.myInterest = interestArray;
        }
    
        await userDetails.save();
    
        res.status(200).json({ message: 'User details updated successfully', userDetails });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    };
*/

/*
exports.updateUserDetails = async (req, res) => {
console.log("req.body---------------",req.body)
  const { userName, dateOfBirth, gender, country, state, mySelf, myParty, myInterest } = req.body;
  const userId = req.params.id;
 
console.log('myInterest------------------',myInterest);
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
          let interestArray = [];
          try {
              interestArray = JSON.parse(myInterest);
          } catch (error) {
              return res.status(400).json({ message: 'Invalid format for myInterest' });
          }

          const validInterests = await Interest.findAll({ where: { id: interestArray } });
          if (validInterests.length !== interestArray.length) {
              return res.status(400).json({ message: 'Invalid interest IDs provided' });
          }

          const interestNames = validInterests.map(interest => interest.name); // Assuming the Interest model has a 'name' field
          userDetails.myInterest = interestArray;
          userDetails.myInterestField = interestNames;
      }

      await userDetails.save();
console.log("userDetails--------------",userDetails);
      res.status(200).json({ message: 'User details updated successfully', userDetails });
  } catch (error) {
      console.error("error------------",error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};
*/

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

/*
exports.getUserDetails = async (req, res) => {
  const userId = req.params.id;

  try {
    // Find user details by userId
    const userDetails = await UserDetails.findOne({
      where: { userId:userId },
  //    attributes: ['userId', 'userName', 'role', 'dateOfBirth', 'gender', 'country', 'state', 'status', 'action', 'mySelf', 'userBannerProfile', 'userProfile', 'myParty', 'myInterest', 'mailId'],
    });

    if (!userDetails) {
      return res.status(404).json({ message: 'User details not found' });
    }

    res.status(200).json( [userDetails] );
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

*/

/*exports.getUserDetails = async (req, res) => {
  const userId = req.params.id;
  console.log("userId---------oog id",userId)
  try {
    // Find user details by userId
console.log("userId------------",userId)
    const userDetails = await UserDetails.findOne({
      where: { userId: userId },
  //    attributes: ['userId', 'userName', 'role', 'dateOfBirth', 'gender', 'country', 'state', 'status', 'action', 'mySelf', 'userBannerProfile', 'userProfile', 'myParty', 'myInterest'],
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

    // Merge userDetails and user data
    const response = {
      ...userDetails.toJSON(),
      fullName: user.fullName,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/
/*
exports.getUserDetails = async (req, res) => {
  const userId = req.params.id;
  console.log("userId---------oog id", userId);
  
  try {
    // Find user details by userId
    console.log("userId------------", userId);
    const userDetails = await UserDetails.findOne({
      where: { userId: userId },
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
    const myPartyData = await MyParty.findOne({
      where: { name: userDetails.myParty },
      attributes: ['icons','name'] // Add any other fields you need from myParty table
    });

    if (!myPartyData) {
      return res.status(404).json({ message: 'myParty details not found' });
    }

    // Merge userDetails, user, and myParty data
    const response = {
      ...userDetails.toJSON(),
      fullName: user.fullName,
      myParty: {
        ...myPartyData.toJSON()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/

exports.getUserDetails = async (req, res) => {
  const userId = req.params.id;
  console.log("userId---------oog id", userId);
  
  try {
    // Find user details by userId
    console.log("userId------------", userId);
    const userDetails = await UserDetails.findOne({
      where: { userId: userId },
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

    // Merge userDetails, user, and myParty data
    const response = {
      ...userDetails.toJSON(),
      fullName: user.fullName,
      myParty: myPartyData ? myPartyData.toJSON() : null
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/*
exports.getUserAllPostsByUserId = async (req, res) => {
  const userId = req.params.id; // Assuming userId is passed as a route parameter

  try {
    // Find all posts for the specified userId
    const posts = await Post.findAll({
      where: { userId: userId }
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

/*exports.getUserAllPostsByUserId = async (req, res) => {
  const userId =req.params.id; // Assuming userId is passed as a route parameter

  try {
    // Find all posts for the specified userId in descending order
    const posts = await Post.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']] // Adjust the column name if necessary
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

exports.createComment = async (req, res) => {
  const { userId, postId, content } = req.body;

  try {
      const newComment = await Comment.create({ userId, postId, content });
      res.status(201).json({ message: 'Comment created successfully', comment: newComment });
  } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

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

    // Check if the userId matches the userId of the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this comment' });
    }

    if (content) {
      comment.content = content;
    }

    await comment.save();

    res.status(200).json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/*
exports.getCommentsByPostId = async (req, res) => {
  const postId = req.params.id;

  try {
      const comments = await Comment.findAll({ where: { postId } });
      res.status(200).json(comments);
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};
*/
/*
exports.getCommentsByPostId = async (req, res) => {
  const postId = req.params.id;

  try {
      // Fetch comments by postId
      const comments = await Comment.findAll({ where: { postId } });
      
      // Create an array of userIds from the comments
      const userIds = comments.map(comment => comment.userId);

      // Fetch user details for those userIds
      const userDetails = await UserDetails.findAll({ where: { userId: userIds } });

      // Create a map of userId to userDetails
      const userDetailsMap = userDetails.reduce((acc, userDetail) => {
        acc[userDetail.userId] = userDetail;
        return acc;
      }, {});

      // Attach user details to the comments
      const commentsWithUserDetails = comments.map(comment => {
        return {
          ...comment.toJSON(),
          userDetails: userDetailsMap[comment.userId] || null
        };
      });

      res.status(200).json(commentsWithUserDetails);
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};*/


exports.getCommentsByPostId = async (req, res) => {
  const postId = req.params.id;
/*
  try {
      // Fetch comments by postId
      const comments = await Comment.findAll({ where: { postId } });

      // Create an array of commentIds from the comments
      const commentIds = comments.map(comment => comment.id);

      // Fetch subComments for those commentIds
      const subComments = await SubComment.findAll({ where: { commentId: commentIds } });

      // Fetch user details for the users who made comments
      const userIds = comments.map(comment => comment.userId);
      const userDetails = await UserDetails.findAll({ where: { userId: userIds } });

      // Create a map of userId to userDetails
      const userDetailsMap = userDetails.reduce((acc, userDetail) => {
        acc[userDetail.userId] = userDetail;
        return acc;
      }, {});

      // Create a map of commentId to subComments
      const subCommentsMap = subComments.reduce((acc, subComment) => {
        if (!acc[subComment.commentId]) {
          acc[subComment.commentId] = [];
        }
        acc[subComment.commentId].push(subComment);
        return acc;
      }, {});

      // Attach user details and subComments to the comments
      const commentsWithUserDetailsAndSubComments = comments.map(comment => {
        return {
          ...comment.toJSON(),
          subComments: subCommentsMap[comment.id] || [],
          userDetails: userDetailsMap[comment.userId] || null,
        //  subComments: subCommentsMap[comment.id] || []
        };
      });

      res.status(200).json(commentsWithUserDetailsAndSubComments);
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Internal server error' });
  }*/
/*try {
    // Fetch comments by postId
    const comments = await Comment.findAll({ where: { postId } });

    // Create an array of commentIds from the comments
    const commentIds = comments.map(comment => comment.id);

    // Fetch subComments for those commentIds
    const subComments = await SubComment.findAll({ where: { commentId: commentIds } });

    // Fetch user details for the users who made comments and sub-comments
    const commentUserIds = [...new Set(comments.map(comment => comment.userId))];
    const subCommentUserIds = [...new Set(subComments.map(subComment => subComment.userId))];
    const allUserIds = [...new Set([...commentUserIds, ...subCommentUserIds])]; // Get unique userIds
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
        }
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
        subComments: subCommentsMap[comment.id] || []
      };
    });

    // Calculate counts
    const commentCount = comments.length;
    const subCommentCount = subComments.length;

    // Add counts to the response
    const response = {
      commentCount,
      subCommentCount,
      comments: commentsWithUserDetailsAndSubComments
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }*/
try {
  // Fetch comments by postId
  const comments = await Comment.findAll({ where: { postId } });

  // Create an array of commentIds from the comments
  const commentIds = comments.map(comment => comment.id);

  // Fetch subComments for those commentIds
  const subComments = await SubComment.findAll({ where: { commentId: commentIds } });

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

  // Fetch likes for comments by commentUserIds
  const commentLikes = await CommentLike.findAll({ where: { userId: commentUserIds, commentId: commentIds } });
  const commentLikesMap = commentLikes.reduce((acc, like) => {
    if (!acc[like.commentId]) {
      acc[like.commentId] = {};
    }
    acc[like.commentId][like.userId] = true; // Set liked to true for comments liked by the user
    return acc;
  }, {});

  // Fetch likes for sub-comments by subCommentUserIds
  const subCommentLikes = await SubCommentLike.findAll({ where: { userId: subCommentUserIds, subCommentId: subComments.map(sc => sc.id) } });
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
      liked: subCommentLikesMap[subComment.id] ? subCommentLikesMap[subComment.id][subComment.userId] || false : false // Set liked flag based on subCommentLikesMap for the specific user
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
      liked: commentLikesMap[comment.id] ? commentLikesMap[comment.id][comment.userId] || false : false // Set liked flag based on commentLikesMap for the specific user
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

/*
exports.likeComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { userId } = req.body;

  try {
    // Check if the user has already liked this comment
    const existingLike = await CommentLike.findOne({ where: { commentId, userId } });

    if (existingLike) {
      return res.status(400).json({ message: 'User has already liked this comment' });
    }

    // Create a new like entry
    await CommentLike.create({ commentId, userId });

    // Increment the like count
    const comment = await Comment.findByPk(commentId);
    comment.likeCount += 1;
    await comment.save();

    res.status(200).json({ message: 'Comment liked successfully' });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Internal server error' });
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

    res.status(200).json({ message: 'Comment liked successfully', liked: true });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Internal server error', liked: false });
  }
};

/*
exports.unlikeComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { userId } = req.body;

  try {
    // Check if the like entry exists
    const existingLike = await CommentLike.findOne({ where: { commentId, userId } });

    if (!existingLike) {
      return res.status(400).json({ message: 'User has not liked this comment' });
    }

    // Remove the like entry
    await CommentLike.destroy({ where: { commentId, userId } });

    // Decrement the like count
    const comment = await Comment.findByPk(commentId);
    comment.likeCount -= 1;
    await comment.save();

    res.status(200).json({ message: 'Comment unliked successfully' });
  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/
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

exports.likeSubComment = async (req, res) => {
/*  const  subCommentId = req.params.commentId;
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
  }*/
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

};

/*
exports.unlikeSubComment = async (req, res) => {
  const subCommentId  = req.params.commentId;
  const { userId } = req.body;

  try {
    // Check if the like entry exists
    const existingLike = await SubCommentLike.findOne({ where: { subCommentId, userId } });

    if (!existingLike) {
      return res.status(400).json({ message: 'User has not liked this sub-comment' });
    }

    // Remove the like entry
    await SubCommentLike.destroy({ where: { subCommentId, userId } });

    // Decrement the like count
    const subComment = await SubComment.findByPk(subCommentId);
    subComment.likeCount -= 1;
    await subComment.save();

    res.status(200).json({ message: 'Sub-comment unliked successfully' });
  } catch (error) {
    console.error('Error unliking sub-comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/
exports.unlikeSubComment = async (req, res) => {
  const subCommentId = req.params.subCommentId; // Corrected parameter name
  const { userId } = req.body;

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


/*exports.getFollowers = async (req, res) => {
  const userId = req.params.userId;
console.log("userId----------------getFollower",userId);
  try {
    const followers = await Follow.findAll({ where: { followingId: userId } });

    const followerIds = followers.map(follow => follow.followerId);
    const followerDetails = await UserDetails.findAll({ where: { userId: followerIds } });

    res.status(200).json(followerDetails);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};*/

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



/*
exports.getFollowing = async (req, res) => {
  const userId = req.params.userId;

  try {
    const followings = await Follow.findAll({ where: { followerId: userId } });

    const followingIds = followings.map(follow => follow.followingId);
    const followingDetails = await UserDetails.findAll({ where: { userId: followingIds } });

    res.status(200).json(followingDetails);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/

/*
exports.getFollowing = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch all followings
    const followings = await Follow.findAll({ where: { followerId: userId } });

    // Map to extract following IDs
    const followingIds = followings.map(follow => follow.followingId);

    // Fetch details of all users being followed
    const followingDetails = await UserDetails.findAll({ where: { userId: followingIds } });

    // Get the count of followings
    const followingCount = followingDetails.length;

    res.status(200).json({
      count: followingCount,
      followings: followingDetails
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/


exports.getFollowing = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch all followings
    const followings = await Follow.findAll({ where: { followerId: userId } });

    // Map to extract following IDs
    const followingIds = followings.map(follow => follow.followingId);

    // Fetch details of all users being followed
    const followingDetails = await UserDetails.findAll({ where: { userId: followingIds } });

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
      count: followingCount,
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

  try {
    // Fetch the user by userId to get the location
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const location = user.location;

    // Fetch newly joined users
    const newUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Fetch location-based users
    let locationUsers = [];
    if (location) {
      locationUsers = await User.findAll({
        where: { location },
        order: [['createdAt', 'DESC']],
        limit: 10
      });
    }

    // Combine both results
    const suggestions = {
      newUsers,
      locationUsers
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

    // Combine both results
    const suggestions = {
      newUsers,
      locationUsers
    };

    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
