    const userModel = require('../models/userModel');
    const {oauth2client} =require('../utils/googleConfig')
    const axios=require('axios');
    const bcrypt = require('bcryptjs');
    const jwt=require('jsonwebtoken');
    const nodemailer = require("nodemailer");
    
    const signupUser = async (req, res) => {
        try {
            const { name, email, password } = req.body;
            
            let user = await userModel.findOne({ email });
            if (user) return res.status(400).json({ message: "User already exists" });
    
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await userModel.create({ name, email, password: hashedPassword, isGoogleUser: false });
    
            res.status(201).json({ message: "Registration successful" });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    };

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const googleLogin=async (req,res)=>{
        try{
        const {code}=req.query;
        if (!code) {
            return res.status(400).json({ error: 'Missing authorization code' });
        }
        const googleRes=await oauth2client.getToken(code);
            oauth2client.setCredentials(googleRes.tokens);
            const userRes=await axios.get(
                `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
            )

            const {email,name}=userRes.data;
            let user=await userModel.findOne({email});
            if(!user){
                user=await userModel.create({
                    name,email, isGoogleUser: true
                })
            }

            const {_id}=user;
            const token=jwt.sign({_id,email},
                process.env.JWT_SECRET,{
                    expiresIn:process.env.JWT_TIMEOUT || '5h'
                } );
            return res.status(200).json({
                message:'Login success',
                token,
                user
            })
        }
        catch(err){
            console.log(err);
            res.status(500).json({
                message:'Internal server error'
            })
        }
    }

    const normalLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }
            const user = await userModel.findOne({ email });
            console.log("User Data:", user);
            if (!user) return res.status(400).json({ message: "User not found" });

            if (user.isGoogleUser && !user.password) {
                return res.status(400).json({ message: "Please set a password first" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Invalid password" });

            const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, { expiresIn: "5h" });

            res.status(200).json({ message: "Login successful", token,email: user.email,
                name: user.name });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    };

    const setPassword = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await userModel.findOne({ email });

            if (!user) return res.status(400).json({ message: "User not found" });

            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            await user.save();

            res.status(200).json({ message: "Password set successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    };
    const forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            const user = await userModel.findOne({ email });
    
            if (!user) return res.status(400).json({ message: "User not found" });
    
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });
    
            const resetLink = `https://emotorado-frontend.onrender.com/reset-password?token=${token}`;
    
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Reset Your Password",
                html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 10 minutes.</p>`
            });
    
            res.status(200).json({ message: "Password reset link sent to email" });
        } catch (err) {
            res.status(500).json({ message: "Internal server error" });
        }
    };
    
    const resetPassword = async (req, res) => {
        try {
            const { token, newPassword } = req.body;
    
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userModel.findOne({ email: decoded.email });
    
            if (!user) return res.status(400).json({ message: "User not found" });
    
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
    
            res.status(200).json({ message: "Password reset successfully" });
        } catch (err) {
            res.status(500).json({ message: "Invalid or expired token" });
        }
    };
    
    module.exports={
        signupUser,googleLogin, normalLogin, setPassword,forgotPassword,resetPassword
    }

