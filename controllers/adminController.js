const User = require('../models/User');
const Interest = require('../models/Interest');
const UserDetails = require('../models/UserDetail');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key_12345';

//Get api
exports.getUserDetails = async (req,res)=>{
    try{
    const user = await UserDetails.findAll();
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