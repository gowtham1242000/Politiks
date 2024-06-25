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
const AdminUser = require('../models/AdminUser');
const MyParty = require('../models/MyParty');

const fs = require('fs');
const path = require('path');

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

exports.updateAdminRolePermissions = async (req, res) => {
  const roleId = req.params.id;
  const { accessPermissions } = req.body;

  try {
      // Find the admin role by ID
      const adminRole = await AdminRole.findByPk(roleId);
      if (!adminRole) {
          return res.status(404).json({ message: 'Admin role not found' });
      }

      // Update only the specified permissions
      accessPermissions.forEach(permission => {
          const section = permission.section;
          const newPermission = permission.permission;

          // Find the existing permission entry in accessPermissions array
          const existingPermission = adminRole.accessPermissions.find(item => item.section === section);
          
          // If found, update the permission; otherwise, create a new entry
          if (existingPermission) {
              existingPermission.permission = newPermission;
          } else {
              adminRole.accessPermissions.push({ section, permission: newPermission });
          }
      });

      // Save the updated admin role with modified permissions
      await adminRole.save();

      res.status(200).json({ message: 'Admin role permissions updated successfully', adminRole });
  } catch (error) {
      console.error('Error updating admin role permissions:', error);
      res.status(500).json({ error: 'Internal server error' });
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

exports.deleteAdminRole = async (req, res) => {
  const roleId = req.params.id;

  try {
      // Find the admin role by ID
      const adminRole = await AdminRole.findByPk(roleId);
      if (!adminRole) {
          return res.status(404).json({ message: 'Admin role not found' });
      }

      // Delete the admin role
      await adminRole.destroy();

      res.status(200).json({ message: 'Admin role deleted successfully' });
  } catch (error) {
      console.error('Error deleting admin role:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};


exports.createAdminUser = async(req,res)=>{
  const { fullName, email, role, password,status } = req.body;

// Validate input
if (!fullName || !email || !role || !password) {
    return res.status(400).json({ message: 'FullName, email, role, and password are required' });
}
try {
    // Check if the user already exists
    const existingUser = await AdminUser.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: 'Email address is already registered' });
    }

    // Create the user
    const newUser = await AdminUser.create({
        fullName,
        email,
        role, // Set the role dynamically based on the input
        password,
        status // Store the password as provided (ensure it's handled securely in production)
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
} catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
}
}

exports.getAdminUser =async(req,res)=>{
  try{
    const adminUser = await AdminUser.findAll();
    res.status(200).json(adminUser);
  }catch(err){
    console.log("err--",err)
    res.status(500).json({error:'Failed to fetch Details'})
  }
}

exports.updateAdminUser = async (req, res) => {
  const userId = req.params.id;
  const { fullName, email, role, password, status } = req.body;

  try {
      // Find the user by ID
      const user = await AdminUser.findByPk(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Update the user fields if provided
      if (fullName) {
          user.fullName = fullName;
      }
      if (email) {
          // Check if the new email is already taken by another user
          const existingUser = await AdminUser.findOne({ where: { email } });
          if (existingUser && existingUser.id !== userId) {
              return res.status(400).json({ message: 'Email address is already registered' });
          }
          user.email = email;
      }
      if (role) {
          user.role = role;
      }
      if (password) {
          user.password = password;
      }
      if (status) {
          user.status = status;
      }

      // Save the updated user
      await user.save();

      res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteAdminUser = async (req, res) => {
  const userId = req.params.id;

  try {
      // Find the user by ID
      const user = await AdminUser.findByPk(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Delete the user
      await user.destroy();

      res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};



const saveImage = (file, entityId) => {
  const entityDir = path.join('/etc/ec/data/myparty', entityId.toString());
  if (!fs.existsSync(entityDir)) {
      fs.mkdirSync(entityDir, { recursive: true });
  }

  const filePath = path.join(entityDir, file.name.replace(/\s+/g, '_'));
  fs.writeFileSync(filePath, file.data);
  return filePath;
};

exports.createMyParty = async (req, res) => {
  const { name, status, viewOrder } = req.body;
  const icons = req.files && req.files.icon;

  try {
      const newMyParty = await MyParty.create({ name, status, viewOrder });

      if (icons && icons.name && icons.data) {
          const iconsPath = saveImage(icons, newMyParty.id);

          // Construct the URL for the image
          const iconsUrl = `https://politiks.aindriya.co.uk/myparty/${newMyParty.id}/${icons.name.replace(/\s+/g, '_')}`;
          newMyParty.icons = iconsUrl;
          await newMyParty.save();
      } else {
          console.error('Invalid icons file:', icons);
      }

      res.status(201).json({ message: 'MyParty created successfully', myParty: newMyParty });
  } catch (error) {
      console.error('Error creating myParty:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};
exports.updateMyParty = async (req, res) => {
    const { id } = req.params;
    const { name, status, viewOrder } = req.body;
    const icons = req.files && req.files.icon;

    try {
        const myParty = await MyParty.findByPk(id);
        if (!myParty) {
            return res.status(404).json({ message: 'MyParty not found' });
        }

        // Only update the fields that are provided
        if (name) myParty.name = name;
        if (status !== undefined) myParty.status = status;
        if (viewOrder !== undefined) myParty.viewOrder = viewOrder;

        if (icons && icons.name && icons.data) {
            const iconsPath = saveImage(icons, myParty.id);

            // Construct the URL for the image
            const iconsUrl = `https://politiks.aindriya.co.uk/myparty/${myParty.id}/${icons.name.replace(/\s+/g, '_')}`;
            myParty.icons = iconsUrl;
        } else if (icons) {
            console.error('Invalid icons file:', icons);
        }

        await myParty.save();

        res.status(200).json({ message: 'MyParty updated successfully', myParty });
    } catch (error) {
        console.error('Error updating myParty:', error);
        res.status(500).json({ message: 'Internal server error' });
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

exports.updateMyParty = async (req, res) => {
  const { id } = req.params.id;
  const { name, status, icons, viewOrder } = req.body;

  try {
      const myParty = await MyParty.findByPk(id);
      if (!myParty) {
          return res.status(404).json({ message: 'MyParty not found' });
      }

      myParty.name = name || myParty.name;
      myParty.status = status || myParty.status;
      myParty.icons = icons || myParty.icons;
      myParty.viewOrder = viewOrder || myParty.viewOrder;

      await myParty.save();
      res.status(200).json({ message: 'MyParty updated successfully', myParty });
  } catch (error) {
      console.error('Error updating myParty:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteMyParty = async (req, res) => {
  const { id } = req.params.id;

  try {
      const myParty = await MyParty.findByPk(id);
      if (!myParty) {
          return res.status(404).json({ message: 'MyParty not found' });
      }

      await myParty.destroy();
      res.status(200).json({ message: 'MyParty deleted successfully' });
  } catch (error) {
      console.error('Error deleting myParty:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};