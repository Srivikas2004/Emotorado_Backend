require('dotenv').config();
const express=require('express');
const app=express();
const mongoose=require('mongoose')
const port=process.env.PORT || 8080;
const authRouter=require('./routes/authRouter')

const cors=require('cors');
const DB_URL=process.env.DB_URL;
app.use(cors());
app.use(express.json()); 
mongoose.connect(DB_URL)
    .then(()=>{
        console.log('Connection Success')
    }).catch((err)=>{
        console.log('Connection failed mongodb', err);
    })
app.get('/',(req,res)=>{
    res.send('Hello from Auth Server');
})

app.use('/auth',authRouter)
app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})