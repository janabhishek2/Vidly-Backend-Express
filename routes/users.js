const express=require('express');
const router=express.Router();
const {User,validateSchema}=require('../models/user');

const mongoose=require('mongoose');

mongoose.connect('mongodb://localhost/Vidly_Node')
.then(res=>{
    console.log("Connected to DB...");
})
.catch(err=>{
    console.log(err.message);
});

router.get('/',async (req,res)=>{
    try{
    const users= await User.find();

    res.send(users);
    return;

    }
    catch(err)
    {
        console.log(err.message);
    }
});

router.get('/:id',async (req,res)=>{
    try{
        const user=await User.findById(req.params.id);
        if(!mongoose.Types.ObjectId.isValid(req.params.id))
        {
            res.status(400).send("Invalid Customer Id");
        }
        if(!user)
        {
            res.status(404).send("User Not Found!");
        }
        return res.send(user);

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
       await newUser.save();
        res.send(newUser);
        return;
    }
    catch(err)
    {
        console.log(err.message);
        res.status(400).send("Bad Request");
        return;
    }
});
router.put('/:id',async (req,res)=>{
    try{
        //find user in db
        const user=await User.findById(req.params.id);
        if(!mongoose.Types.ObjectId.isValid(req.params.id))
        {
            res.status(400).send("Invalid Customer Id");
        }
        if(!user)
        {
            res.status(404).send("User Not Found!");
        }

        //check if update properties are valid or not
        const user1={
            name : req.body.name,
            email: req.body.email,
            password:req.body.password
        };
        const {error}=validateSchema(user1);
        if(error)
        {
            res.status(400).send(error.details[0]);
            return;
        }

        //update current user
        const out=await User.findByIdAndUpdate(req.params.id,user1);
        res.send(user1);
        return;

    }
    catch(err)
    {
        console.log(err.message);
        return;
    } 
});

router.delete('/:id',async (req,res)=>{

    try{
        //check for valid id
        if(!mongoose.Types.ObjectId.isValid(req.params.id))
        {
            res.status(400).send("Invalid Customer Id");
        }

            //find user in db
            const user=await User.findById(req.params.id);
            if(!user)
            {
                res.status(404).send("User Not Found!");
            }

            //delete User
            const out= await User.deleteOne({_id:req.params.id});
            return;
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).send("Some error occured");
        return;
    }
})
module.exports=router;