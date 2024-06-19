const User = require('../models/User');
const Interest = require('../models/Interest');
const UserDetails = require('../models/UserDetail');
const UserInterest = require('../models/UserInterest');
const LeaderVerify = require('../models/LeaderVerify');
const Following = require('../models/Following');

const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');


const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key_12345';


exports.register = async (req, res) => {
    const { email, password, userName } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Assuming password hashing is not required
        // const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password, // Storing the raw password; consider hashing in a real application
            fullName: userName || null, // Store userName if present, otherwise store null
            // role: 'User', // Default role
            // status: true  // Default status for regular users
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


exports.createUserDetails = async (req, res) => {
    const { userName, role, dateOfBirth, gender, country, state } = req.body;

    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);
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
    

        const userDetails = await UserDetails.create({
            userId,
            userName,
            mailId:user.email,
            role,
            dateOfBirth,
            gender,
            country,
            state,
            status
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
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        // Save token to the database
        user.token = token;
        await user.save();

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

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


  //handle updateUserDetails

//   const userProfileDir = '/etc/ec/data/UserProfile'; // Define the directory to store profile images
// const userBannerDir = '/etc/ec/data/UserBanner'; // Define the directory to store banner images

// // Ensure the directories exist
// if (!fs.existsSync(userProfileDir)) {
//     fs.mkdirSync(userProfileDir, { recursive: true });
// }

// if (!fs.existsSync(userBannerDir)) {
//     fs.mkdirSync(userBannerDir, { recursive: true });
// }

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
    const { userName, role, dateOfBirth, gender, country, state, mySelf, myParty, myInterest } = req.body;
    const userId = req.params.id;

    try {
        const userDetails = await UserDetails.findOne({ where: { userId } });
        if (!userDetails) {
            return res.status(404).json({ message: 'User details not found' });
        }

        // Only update the fields that are provided
        if (userName) userDetails.userName = userName;
        if (role) userDetails.role = role;
        if (dateOfBirth) userDetails.dateOfBirth = dateOfBirth;
        if (gender) userDetails.gender = gender;
        if (country) userDetails.country = country;
        if (state) userDetails.state = state;
        if (mySelf) userDetails.mySelf = mySelf;
        if (myParty) userDetails.myParty = myParty;

        // Update status based on role
        userDetails.status = (role === 'Follower') ? true : false;

        // Save profile banner if provided
        if (req.files && req.files.userBannerProfile) {
            const userBannerProfile = req.files.userBannerProfile;
            const userBannerProfilePath = saveImages(userBannerProfile, userId, userBannerDir);

            // Construct the URL for the banner
            const userBannerProfileUrl = `https://yourdomain.com/UserBanner/${userId}/${userBannerProfile.name.replace(/\s+/g, '_')}`;
            userDetails.userBannerProfile = userBannerProfileUrl;
        }

        // Save profile image if provided
        if (req.files && req.files.userProfile) {
            const userProfile = req.files.userProfile;
            const userProfilePath = saveImages(userProfile, userId, userProfileDir);

            // Construct the URL for the profile image
            const userProfileUrl = `https://yourdomain.com/UserProfile/${userId}/${userProfile.name.replace(/\s+/g, '_')}`;
            userDetails.userProfile = userProfileUrl;
        }

        // Update myInterest if provided
        if (myInterest) {
            const validInterests = await Interest.findAll({ where: { id: myInterest } });
            if (validInterests.length !== myInterest.length) {
                return res.status(400).json({ message: 'Invalid interest IDs provided' });
            }

            await UserInterest.destroy({ where: { userDetailsId: userDetails.id } }); // Remove old interests
            await Promise.all(validInterests.map(interest => {
                return UserInterest.create({
                    userDetailsId: userDetails.id,
                    interestId: interest.id
                });
            }));

            userDetails.myInterest = myInterest;
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

    const filePath = path.join(userDir, `${Date.now()}-${file.name.replace(/\s+/g, '_')}`);
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
            verificationImageUrl =`https://politiks.aindriya.co.uk/${userId}/${verificationImage.name.replace(/\s+/g, '_')}`;
        }

        let verificationVideoUrl = null;
        if (verificationVideo) {
            const verificationVideoPath = saveFileverify(verificationVideo, userId, userVerificationDir);

            // Construct URL for verification video
            verificationVideoUrl = `https://politiks.aindriya.co.uk/${userId}/${verificationVideo.name.replace(/\s+/g, '_')}`;
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
