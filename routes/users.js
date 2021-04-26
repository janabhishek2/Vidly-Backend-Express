const express=require('express');
const router=express.Router();
const {User,validateSchema}=require('../models/user');
const _=require('lodash');
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const auth=require('../middleware/auth');

mongoose.connect('mongodb://localhost/Vidly_Node')
.then(res=>{
    console.log("Connected to DB...");
})
.catch(err=>{
    console.log(err.message);
});

router.get('/me',auth,async (req,res)=>{
    try{
     const user=await User.findById(req.user._id);
     if(!user)
     {
         res.status(404).send("User Not Found!");
     }
     res.send(_.pick(user,['name','email','_id']));
    }
    catch(err)
    {
        console.log(err.message);
        return;
    }
});
router.post('/',async (req,res)=>{
    try{
        const user={
            name : req.body.name,
            email: req.body.email,
            password:req.body.password
        };
        const {error}=validateSchema(user);
        if(error)
        {
            res.status(400).send(error.details[0].message);
            return;
        }
        let newUser = await User.findOne({email: req.body.email});
        if(newUser)
        {
            return res.status(400).send("User already exists");
        }
        newUser=new User({
            name:user.name,
            email:user.email,
            password:user.password
        });

        const salt=await bcrypt.genSalt(11);
        const hashed=await bcrypt.hash(newUser.password,salt);
        newUser.password=hashed;

        await newUser.save();
        const token=newUser.generateAuthToken();
        res.header('x-auth-token',token).send(_.pick(newUser,['_id','name','email']));
        return;
    }
    catch(err)
    {
        console.log(err.message);
        res.status(400).send("Bad Request");
        return;
    }
});


module.exports=router;