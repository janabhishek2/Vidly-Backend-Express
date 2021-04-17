const express=require('express');
const mongoose=require('mongoose');
const Joi=require('joi');

const app=express();
app.use(express.json());
mongoose.connect('mongodb://localhost/Vidly_Node')
.then(res=>{
    console.log("Connected To DB ... ");
})
.catch(err=>{
    console.log(err.message);
});

const customerSchema= new mongoose.Schema({
    isGold : {
        type : Boolean,
        required :true
    },
    name : {
        type : String,
        required:true,
        minlength:1,
        maxlength:25,
        trim:true,
    },
    phone : {
        type:String,
        required:true,
        minlength:10,
        maxlength:10,
        trim:true
    }

})
const Customer=mongoose.model('Customer',customerSchema);

async function oneTime()
{
    try{
        const customers=await Customer.find();
        customers.forEach(async (c)=>{
          const res=  await Customer.deleteOne({_id : c._id});
          console.log(res);
        });
    }
   
    catch(err)
    {
        console.log(err.message);
    }
}

app.get('/api/customers',async (req,res)=>{

    try{
        const customers=await Customer.find();
        res.send(customers);
    }
    catch(err)
    {
        console.log(err.message);
    }
    

});

app.get('/api/customers/:id',async (req,res)=>{

    try{
        const customer=await Customer.find({_id : req.params.id});
        if(customer.length==0)
        {
            res.status(404).send("Not Found");
            return;
        }
        else
        {
            res.send(customer);
            return;
        }

    }
    catch(err)
    {
        console.log(err.message);
    }
});

const joiSchema={
    isGold:Joi.boolean().required(),
    name :Joi.string().min(1).max(25).required(),
    phone : Joi.string().min(10).max(10).required()

}
function validateSchema(inp)
{
    return Joi.validate(inp,joiSchema);
}
app.post('/api/customers',async (req,res)=>{

    try
    {
    const customer={
        isGold : req.body.isGold,
        name : req.body.name,
        phone : req.body.phone
    };

    const ans=validateSchema(customer);
    if(ans.error)
    {
        return res.status(400).send(ans.error.details);
    }
    else
    {
        const newCustomer = new Customer({
            isGold : customer.isGold,
            name : customer.name,
            phone :customer.phone
        });

        const ans=await newCustomer.save();
        console.log(ans);
        return res.send(ans);
    }
}
catch(err)
{
    console.log(err.message);
}

});

app.put('/api/customers/:id',async (req,res)=>{

    try{
        const customer=await Customer.find({_id : req.params.id});
        
        if(customer.length==0)
        {
            console.log(customer);
            return res.status(404).send("Not Found");
        }
        else
        {
            const cust={
                isGold:req.body.isGold,
                name :req.body.name,
                phone:req.body.phone
            };
            const ans=validateSchema(cust);
            if(ans.error)
            {
                return res.status(400).send("Bad request");
            }
            else
            {
                const updatedCustomer= await Customer.findByIdAndUpdate(req.params.id,cust );
                return res.send(cust);
            }
        }
    }
    catch(err)
    {
        console.log(err.message);
        return ;
    }
});

app.delete('/api/customers/:id',async (req,res)=>{

    try{

        const customer=await Customer.find({_id : req.params.id});
        if(customer.length==0)
        {
            return res.status(404).send("Not Found");
        }
        else
        {
            const deletedCustomer=await Customer.findByIdAndDelete(req.params.id);
            console.log(deletedCustomer);
            return res.send(deletedCustomer);

        }
    }
    catch(err)
    {
        console.log(err.message);
    }


})
const port=process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log("Listening on port  : "+port);
})