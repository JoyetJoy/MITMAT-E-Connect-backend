const signupModel = require('../../Models/signupmodel');
const bcryptjs = require('bcryptjs');
const jwt=require('jsonwebtoken')
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const generateOtp=require('../utils/otpGenerator')
const sendEmail=require('../utils/sentEmail');
const Mail = require('nodemailer/lib/mailer');
let Mailotp='';

exports.signupPost = async (req, res) => {
    
  try {
    const { username, email, password, phonenumber, role } = req.body;

    const validatingEmail = emailRegex.test(email);
    const validatingPassword = passwordRegex.test(password);

    if (!username || !email || !password || !phonenumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (!validatingEmail) {
      return res.status(400).json({ message: 'Please enter a valid email' });
    }
    
    if (!validatingPassword) {
      return res.status(400).json({ message: 'Please enter a valid password' });
    }

    const userExist = await signupModel.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: `${userExist.role} already exists` });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new signupModel({
      username,
      email,
      password:hashedPassword,
      phonenumber,
      role
    });

    await newUser.save();
    const otp=generateOtp();
    Mailotp=otp;
    sendEmail(email,otp)
    const user = await signupModel.findOne({ email });
    return res.status(201).json({user ,message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully` });  
  } catch (error) {
    console.error(error); // Logging the error can be helpful for debugging
    return res.status(500).json({ message: 'Server error' });
  }
}

exports.loginPost = async(req,res)=>{
  try{
    const {email,password,role}=req.body;
    const validateEmail=emailRegex.test(email);
    const validatePassword=passwordRegex.test(password);
    if(!email||!password||!role){
      return res.status(400).json({message:'All fields are required'})
    }else if(!validateEmail){
      return res.status(400).json({message:'Enter a valid email'})
    }else if(!validatePassword){
      return res.status(400).json({message:'Enter a valid password'})
    }
    const userExist=await signupModel.findOne({email,role})
    if(!userExist){
      return res.status(400).json({message:`${role} doesn't exist`})
    }
    const passmatch=await bcryptjs.compare(password,userExist.password)
    
    if(!passmatch){
      return res.status(400).json({message:'Password not match'})
    }
    if(userExist.verified==false){
      const otp=generateOtp();
      Mailotp=otp;
      sendEmail(email,otp)
      return res.status(401).json({user:userExist._id ,message:'Email not verified'})
    }
    const payload={
      userExist:userExist
    }

    const token=jwt.sign(payload,process.env.JWT_SECRET)
    return res.status(200).json({message:'Login successfull',token})
  }catch(error){
    return res.status(500).json({ message: 'Server error' });
  }
}
exports.otpPost = async (req, res) => {
  try {
    const { otp, id } = req.body;
    const trimmedOtp = otp.trim();
    const trimmedMailotp = Mailotp.toString().trim();

    if (trimmedOtp !== trimmedMailotp) {
      return res.status(400).json({ message: 'Enter a valid otp' });
    }

    await signupModel.updateOne({ _id: id }, { $set: { verified: true } }, { new: true });
    return res.status(200).json({ message: 'OTP successful' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};



