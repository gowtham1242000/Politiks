const User = require('../models/User');
const Interest = require('../models/Interest');
const UserDetails = require('../models/UserDetail');
const UserInterest = require('../models/UserInterest');
const LeaderVerify = require('../models/LeaderVerify');
const Admin = require('../models/Admin');
const Following = require('../models/Following');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key_12345';
const AdminSetting = require('../models/AdminSetting');
const Country = require('../models/Country');
const State = require('../models/State');
const AdminRole = require('../models/AdminRole');

exports.createCountry= async (req,res)=>{
  try {
    const country = await Country.create(req.body);
    res.status(201).json(country);
} catch (error) {
    res.status(500).json({ error: error.message });
}
}

exports.createState = async (req,res)=>{
  const { countryId } = req.params.id;
    const { name } = req.body;

    try {
        // Check if the country exists
        const country = await Country.findByPk(countryId);
        if (!country) {
            return res.status(404).json({ message: 'Country not found' });
        }

        const state = await State.create({ name, countryId });
        res.status(201).json(state);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.bulkCreateState = async (req,res) =>{
  const  countryId  = req.params.id;
    const { states } = req.body; // Assuming states is an array of state names

    try {
        // Check if the country exists
        const country = await Country.findOne({where:{id:countryId}});
        if (!country) {
            return res.status(404).json({ message: 'Country not found' });
        }

        const stateData = states.map(stateName => ({
            name: stateName,
            countryId,
        }));

        const createdStates = await State.bulkCreate(stateData);
        res.status(201).json(createdStates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



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
    const { name, status } = req.body;
    try {
      const interest = await Interest.create({ name, status});
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

exports.updateUserDetails = async (req, res) => {
console.log("req.body-------------",req.body)
  const { status } = req.body;
  const userId = req.params.id;

  try {
    // Check if the user exists and fetch their details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch user details by userId
    const userDetails = await UserDetails.findOne({ where: { userId } });
    if (!userDetails) {
      return res.status(404).json({ message: 'User details not found' });
    }

    // Update status and action based on the role
    if (userDetails.role === 'Leader') {
      userDetails.status = status;
      userDetails.action = status ? 'Approved' : 'Declined'; // Update action based on status
      await userDetails.save();

      return res.status(200).json({ message: 'User details updated successfully', userDetails });
    } else {
      return res.status(403).json({ message: 'You do not have permission to update status for this user' });
    }
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getApprovedLeaders = async(req,res) =>{  
try {
    const leaderUserDetails = await UserDetails.findAll({
      where: {
        role: 'Leader',
        status: true
      }
    });

    res.status(200).json(leaderUserDetails);
  } catch (error) {
    console.error('Error fetching leader UserDetails:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.createAdminSetting = async (req, res) => {
  const { locationSetting, paymentGatewaySetting, forceUpdate } = req.body;

  try {
    const adminSetting = await AdminSetting.create({
      locationSetting,
      paymentGatewaySetting,
      forceUpdate,
    });

    res.status(201).json(adminSetting);
  } catch (error) {
    console.error('Error creating AdminSetting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get AdminSetting
exports.getAdminSetting = async (req, res) => {
  try {
    const adminSetting = await AdminSetting.findOne();
    if (!adminSetting) {
      return res.status(404).json({ message: 'AdminSetting not found' });
    }
    res.status(200).json(adminSetting);
  } catch (error) {
    console.error('Error fetching AdminSetting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update AdminSetting
exports.updateAdminSetting = async (req, res) => {
  const { locationSetting, paymentGatewaySetting, forceUpdate } = req.body;

  try {
    let adminSetting = await AdminSetting.findOne();
    if (!adminSetting) {
      return res.status(404).json({ message: 'AdminSetting not found' });
    }

    // Update only the fields that are provided in the request
    if (locationSetting) {
      adminSetting.locationSetting = locationSetting;
    }
    if (paymentGatewaySetting) {
      adminSetting.paymentGatewaySetting = paymentGatewaySetting;
    }
    if (forceUpdate) {
      adminSetting.forceUpdate = forceUpdate;
    }

    await adminSetting.save();

    res.status(200).json(adminSetting);
  } catch (error) {
    console.error('Error updating AdminSetting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete AdminSetting (Optional, depending on your requirements)
exports.deleteAdminSetting = async (req, res) => {
  try {
    const adminSetting = await AdminSetting.findOne();
    if (!adminSetting) {
      return res.status(404).json({ message: 'AdminSetting not found' });
    }

    await adminSetting.destroy();

    res.status(204).json({ message: 'AdminSetting deleted successfully' });
  } catch (error) {
    console.error('Error deleting AdminSetting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createAdminRole = async (req, res) => {
  try {
    const { name, accessPermissions } = req.body;

    const processedAccessPermissions = accessPermissions.map(permission => {
      const section = Object.keys(permission)[0];
      return {
        section,
        permission: permission[section]
      };
    });

    const newAdminRole = await AdminRole.create({ name, accessPermissions: processedAccessPermissions });
    res.status(201).json(newAdminRole);
  } catch (err) {
    console.error('Error creating admin role:', err);
    res.status(500).json({ error: 'Failed to create admin role' });
  }
};

exports.getAllAdminRole = async (req, res) => {
  try {
    const adminRoles = await AdminRole.findAll();
    res.status(200).json(adminRoles);
  } catch (err) {
    console.error('Error fetching admin roles:', err);
    res.status(500).json({ error: 'Failed to fetch admin roles' });
  }
};

