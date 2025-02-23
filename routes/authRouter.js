const { signupUser,googleLogin ,normalLogin,forgotPassword,resetPassword} = require('../controllers/authController');

const router=require('express').Router();

router.get('/test',(req,res)=>{
    res.send('test pass');
})

router.get('/google/callback',googleLogin);
router.post("/login", normalLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",resetPassword);
router.post("/signup",signupUser);
module.exports=router;
