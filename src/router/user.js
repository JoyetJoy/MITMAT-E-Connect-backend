const express=require('express')
const router=express.Router()

const authController=require('../controller/auth')

router.post('/signup',authController.signupPost)
router.post('/login',authController.loginPost)
router.post('/otp',authController.otpPost)

module.exports=router