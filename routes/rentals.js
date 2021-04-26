const mongoose=require('mongoose');
const {Rental, validateSchema}=require('../models/rental');

const express=require('express');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const router=express.Router();
const auth=require('../middleware/auth');

mongoose.connect('mongodb://localhost/Vidly_Node')
.then(res=>{
    console.log("Connected To DB ... ");
})
.catch(err=>{
    console.log(err.message);
});

router.get('/',auth,async (req,res)=>{
    try{
        const rentals=await Rental.find();

        return res.send(rentals);
    }
    catch(err)
    {
        console.log(err.message);
        return;
    }
});

router.get('/:id',auth,async (req,res)=>{
    try{
        if(!mongoose.Types.ObjectId.isValid(req.params.id))
        {
            return res.status(400).send("Invalid Movie Id");
        }
        const rental=await Rental.findById(req.params.id);

        if(!rental)
        {
            return res.status(404).send("Rental Not Found");
        }
        else
        {
            res.send(rental);
            return;
        }
    }
    catch(err)
    {
        console.log(err.message);
        return;
    }
});

router.post('/',auth,async (req,res)=>{
    try{
        const rental={
            customerId:req.body.customerId,
            movieId:req.body.movieId,
        }
        const {error}=validateSchema(rental);
        if(error)
        {
            return res.status(400).send("Incorrect Data");
        }
        /* const objectValidation=mongoose.Types.ObjectId.isValid(rental.customerId) && mongoose.Types.ObjectId.isValid(rental.movieId);
        if(!objectValidation)
        {
            return res.status(400).send("Incorrect Data");
        } */
        const customer=await Customer.findById(rental.customerId);
        const movie=await Movie.findById(rental.movieId);

        if(!customer || !movie)
        {
            return res.status(404).send("Customer or movie not found!");
        }
        const newRental= new Rental({
            customer:{
                _id : customer._id,
                isGold:customer.isGold,
                name :customer.name,
                phone :customer.phone
            },
            movie:{
                _id : movie._id,
                title:movie.title,
                dailyRentalRate:movie.dailyRentalRate
            },  
            rentalRate:movie.dailyRentalRate
        });

      if(movie.numberInStock==0)
      {
          return res.status(400).send("Movie not in stock");
      }
      const ans=  await newRental.save();
      res.send(ans);
   
      movie.numberInStock--;
      const ans1=  await movie.save();
  
     return;
    }
    catch(err)
    {
        console.log(err.message);
        return;
    }
});
router.put('/:id',async (req,res)=>{

   
        const rental=await Rental.findById(req.params.id);
        if(!rental)
        {
            res.status(404).send("Rental Not Found !");
            return;
        }
        const {error}=validateSchema(req.body);
        if(error)
        {
            return res.status(400).send("Bad Request");
        }
        if(rental.returned==true)
        {
            return res.status(400).send("Movie Already Returned !");
        }
        if(req.body.returned==true && rental.returned==false)
        {
            rental.returned=true;
            const today=new Date();
            rental.dateReturned=today;
            const days=(today.getTime()-rental.dateOut)/(1000*60*60*24);
            const money=days*rental.rentalRate;
            rental.incomeFromRental=money;
        }

        await rental.save();
        return res.send(rental);

    
})

module.exports=router;