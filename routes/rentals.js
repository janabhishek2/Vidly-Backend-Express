const mongoose=require('mongoose');
const {Rental, validateSchema}=require('../models/rental');

const express=require('express');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const router=express.Router();


mongoose.connect('mongodb://localhost/Vidly_Node')
.then(res=>{
    console.log("Connected To DB ... ");
})
.catch(err=>{
    console.log(err.message);
});

router.get('/',async (req,res)=>{
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

router.get('/:id',async (req,res)=>{
    try{
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

router.post('/',async (req,res)=>{
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
    console.log(ans);
      movie.numberInStock--;
      const ans1=  await movie.save();
      console.log(ans1);
       return;
    }
    catch(err)
    {
        console.log(err.message);
        return;
    }
});

module.exports=router;