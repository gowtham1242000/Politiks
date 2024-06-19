const User = require('../models/User');
const Interest = require('../models/Interest');
const UserDetails = require('../models/UserDetail');
const UserInterest = require('../models/UserInterest');
const LeaderVerify = require('../models/LeaderVerify');
const Admin = require('../models/Admin');
const Following = require('../models/Following');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key_12345';


exports.adminRegister = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ where: { email, role: 'admin' } });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }
  
      // Create new admin user
      const admin = await Admin.create({ email, password, role: 'admin' });
  
      res.status(201).json({ message: 'Admin registered successfully', admin });
    } catch (error) {
      console.error('Error registering admin:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find admin user by email
      const admin = await Admin.findOne({ where: { email, role: 'admin' } });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Compare passwords (plain text comparison for demonstration, NOT RECOMMENDED for production)
      if (admin.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error logging in admin:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

//Get api
exports.getUserDetails = async (req,res)=>{
    try{
    const user = await UserDetails.findAll({where:{role:'Follower'}});
    console.log("user-------",user);
    res.status(200).json(user)
    console.log(user);
    }catch(error){
        res.status(500).json({message:'Internal Server Error'})
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


//create api



exports.CreateInterest = async (req, res) => {
    const { name } = req.body;
    try {
      const interest = await Interest.create({ name});
      res.status(201).json(interest);
    } catch (error) {
        console.log("error------",error)
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  exports.getLeaderDetails = async (req, res) => {
    try {
        // Fetch all user details where role is 'Leader'
        const leaders = await UserDetails.findAll({
            where: { role: 'Leader' },
            // include: [{
            //     model: User,
            //     attributes: ['email', 'createdAt'] // Adjust fields as necessary
            // }]
        });

        // If no leaders found, return appropriate response
        if (!leaders || leaders.length === 0) {
            return res.status(404).json({ message: 'No leaders found' });
        }

        // Fetch leader verification details
        const leaderDetailsWithVerification = await Promise.all(leaders.map(async (leader) => {
            const verificationDetails = await LeaderVerify.findOne({ where: { userId: leader.userId } });
            return {
                ...leader.toJSON(),
                verificationDetails: verificationDetails ? verificationDetails.toJSON() : null
            };
        }));

        res.status(200).json({ leaders: leaderDetailsWithVerification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};