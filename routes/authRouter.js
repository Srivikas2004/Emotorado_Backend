const { googleLogin ,normalLogin,setPassword,forgotPassword,resetPassword} = require('../controllers/authController');

const router=require('express').Router();

router.get('/test',(req,res)=>{
    res.send('test pass');
})

router.get('/google',googleLogin);
router.post("/login", normalLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",resetPassword);
module.exports=router;