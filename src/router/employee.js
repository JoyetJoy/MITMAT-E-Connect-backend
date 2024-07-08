const express=require('express')
const router=express.Router();
const profileController=require('../controller/employee/profile')

router.get('/profileGet',profileController.profileGet)
router.put('/profilePut',profileController.profilePut)
router.post('/updatepassword',profileController.updatePasswordPost)
router.delete('/deleteaccount',profileController.deleteAccount)



module.exports=router