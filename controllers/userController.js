const User = require('../models/User');
const Interest = require('../models/Interest');
const UserDetails = require('../models/UserDetail');
const UserInterest = require('../models/UserInterest');
const LeaderVerify = require('../models/LeaderVerify');
const Following = require('../models/Following');
//const { Sequelize } = require('../models');
const UserForgetOtp = require('../models/UserForgetOtp');
const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');

const { generateOTP, sendOTP } = require('../middleware/otpService');

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key_12345';
const {Sequelize} =require('sequelize')

// Ensure your function is declared as an async function
exports.register = async (req, res) => {
  const { email, password, userName, googleId } = req.body;

  try {
      if (googleId) {
          // Social login flow via Google OAuth
          let user = await User.findOne({ where: { googleId } });

          if (user) {
              // User exists, handle accordingly (e.g., update user details if needed)
              return res.status(400).json({ message: 'User already exists' });
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
          // Normal registration flow with email and password
          const existingUser = await User.findOne({ where: { email } });

          if (existingUser) {
              // User exists, handle accordingly (e.g., update user details if needed)
              return res.status(400).json({ message: 'User already exists' });
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
// User registration
// exports.register = async (req, res) => {
//     const { email, password, role, uniqueName, dateOfBirth, gender, country, state, interests, accountsToFollow } = req.body;

//     try {
//         const existingUser = await User.findOne({ where: { email } });
//         if (existingUser) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // Create user with default status false for leaders
//         const newUser = await User.create({
//             email,
//             password,
//             role,
//             status: role === 'Leader' ? false : true,
//             uniqueName,
//             //iam,
//             dateOfBirth,
//             gender,
//             country,
//             state,
//             interests,
//             accountsToFollow
//         });

//         res.status(201).json({ message: 'User registered successfully', user: newUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// }

// User login
// User login
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
  const userId = req.params.id; // Correctly access userId from req.params

  try {
      const user = await User.findOne({ where: { id: userId } });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Assuming you have a method to validate password
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
        if (interests.length !== interestIds.length) {
            return res.status(404).json({ message: 'One or more interests not found' });
        }

        // Update the UserDetails table
        const userDetails = await UserDetails.findOne({ where: { userId } });
        if (!userDetails) {
            return res.status(404).json({ message: 'User details not found' });
        }
        userDetails.myInterest = interestIds;
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

    exports.following = async(req,res) =>{
        console.log("req.body-------",req.body)
    const {followerId } = req.body;

    const userId = req.params.id;
  
    try {
      // Create a new following relationship
      const newFollowing = await Following.create({ userId, followerId });
  
      res.status(201).json({ message: 'User followed successfully', following: newFollowing });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

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

    // Count the number of followers for each user
    const followerCount = await Following.count({
      where: {
        userId: userId,
      },
    });

    res.json({ followingList: followerIds, followerCount: followerCount });
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ message: 'Internal server error' });
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
  
  exports.createPost = async (req, res) => {
    const { tagUser, caption } = req.body;
    const userId = req.params.id;
    const image = req.files && req.files.image;
    const location ="kochi";

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

exports.updateUserDetails = async (req, res) => {
    const { userName, dateOfBirth, gender, country, state, mySelf, myParty, myInterest } = req.body;
    console.log("req.body----------",req.body)
    const userId = req.params.id;
console.log("req.body--------",req.body);
    try {
        const userDetails = await UserDetails.findOne({ where: { userId } });
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
