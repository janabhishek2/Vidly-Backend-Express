const express=require('express');
const router=express.Router();
const {Movie,validateSchema}=require('../models/movie');
const mongoose=require('mongoose');
const {Genre}=require('../models/genre');

mongoose.connect('mongodb://localhost/Vidly_Node')
.then(res=>{
    console.log("Connected To DB ... ");
})
.catch(err=>{
    console.log(err.message);
});


router.get('/',async (req,res)=>{
    try{
        const movies=await Movie.find();
        return res.send(movies);
    }
    catch(err)
    {
        console.log(err.message);
        return;
    }
});

router.get('/:id',async (req,res)=>{
    try{
        const movie=await Movie.findById(req.params.id);
        if(!movie)
        {
            return res.status(404).send("Not Found");
        }
        else
        {
            return res.send(movie);
        }
    }
    catch(err)
    {
        console.log(err.message);
        return;
    }
})

router.post('/',async (req,res)=>{
    try{
        const movie={
            title : req.body.title,
            genreId: req.body.genreId,
            numberInStock:req.body.numberInStock,
            dailyRentalRate:req.body.dailyRentalRate
        };

        const result=validateSchema(movie);
        if(result.error)
        {
            return res.status(400).send(result.error);
        }
        else
        {
            const genre=await Genre.findById(movie.genreId);
            if(!genre)
            {
                return res.status(400).send('Invalid Genre');
            }
            const newMovie= new Movie({
                title:movie.title,
                genre:{
                    _id: genre._id,
                    name : genre.name
                },
                numberInStock:movie.numberInStock,
                dailyRentalRate: movie.dailyRentalRate
            });

          const ans=  await newMovie.save();
          res.send(ans);
          return;
        }

    }
    catch(err)
    {
        console.log(err.message);
    }
});

router.put('/:id',async (req,res)=>{

    try{
        const movie=await Movie.findById(req.params.id);
        if(!movie)
        {
            return res.status(404).send("Movie Not Found !");
        }
        const newMovie={
            title : req.body.title,
            genreId : req.body.genreId,
            numberInStock :req.body.numberInStock,
            dailyRentalRate:req.body.dailyRentalRate
        }
        const {error}= validateSchema(newMovie);
        if(error)
        {
            return res.status(400).send("Bad update request");
        }
       else
       {
           const genre=await Genre.findById(newMovie.genreId);
           if(!genre)
           {
               return res.status(400).send("Invalid Genre");
           }
           else
           {
               const updatedMovie={
                   title : newMovie.title,
                   genre:{
                       _id : genre._id,
                       name : genre.name
                   },
                   numberInStock:newMovie.numberInStock,
                   dailyRentalRate:newMovie.dailyRentalRate
               }

           const ans= await Movie.findByIdAndUpdate(req.params.id,updatedMovie);
           console.log(ans);
           return res.send(updatedMovie);
           }
       }
        
    }
    catch(err)
    {
        console.log(err.message);
        return;
    }
});

router.delete('/:id',async (req,res)=>{
    try{
        const movie=await Movie.findById(req.params.id);
        if(!movie)
        {
            return res.status(404).send("Movie Not found");
        }
        const ans=await Movie.findByIdAndDelete(req.params.id);
        return res.send(ans);
    }
    catch(err)
    {
        console.log(err.message);
    }
   
})
module.exports=router;
