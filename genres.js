const express = require("express");
const app = express();
const Joi = require("joi");
const { validate } = require("joi/lib/types/object");
const mongoose=require('mongoose');
app.use(express.json());

const genres = [
  { id: 1, name: "Action" },
  { id: 2, name: "Comedy" },
  { id: 3, name: "Horror" },
  { id: 4, name: "SciFi" },
  { id: 5, name: "Romance" },
];

mongoose.connect('mongodb://localhost/Vidly_Node')
.then(res=>{
  console.log("Connected to db ... ");
})
.catch(err=>{
  console.log(err.message);
});

const genreSchema=new mongoose.Schema({
  name : {
    type :String,
    required :true,
    trim :true,
    maxlength:20,
    minlength :3
  }
})

const Genre = mongoose.model('Genre',genreSchema);

async function oneTime() //call me to reset genres collection

{

  const gens=await Genre.find();
  gens.forEach(async (g)=>{

    try{
      const res= await Genre.deleteOne({_id : g._id});
      console.log(res);
    }
    catch(err)
    {
      console.log(err.message);
    }
  });


  genres.forEach(g=>{

    const temp=new Genre({
      name : g.name
    });

    temp.save()
    .then(res=>{
      console.log(res);
    })
    .catch(err=>{
      console.log(err.message);
    });

  })
}
app.get("/api/genres", (req, res) => {

  const gs=Genre.find()
  .then(r=>{
    res.send(r);
  })
  .catch(err=>{
    console.log(err.message);
  });

});

app.get("/api/genres/:id", (req, res) => {

  Genre.find({_id : req.params.id})
  .then(genre=>{
    if(!genre)
    {
      res.status(404).send("Genre Not Found !");
      return;
    }
  
    else
    {
      res.send(genre);
    }  
  })
  .catch(err=>{
    console.log(err.message);
  })
  ;

 
  /* const genre = genres.find((g) => {
    return g.id == req.params.id;
  });
  if (!genre) {
    return res.status(404).send("Not  Found");
  } else {
    res.send(genre);
  } */
});
const schema = {
  name: Joi.string().min(3).max(20).required(),
};

function validateSchema(inp) {
  return Joi.validate(inp, schema);
}

app.post("/api/genres", async (req, res) => {

  const genre = {
    name : req.body.name
  };

  const result=validateSchema(genre);

  if(result.error)
  {
    return res.status(400).send("Invalid Input");
  }
  else
  {
    const newGenre= new Genre({
      name : genre.name
    });
    try{
      const result=await newGenre.save();
      console.log(res);
      return res.send(result);
    }
    catch(err)
    {
      console.log(err.message);
    }
    
  }

  /* const length = Genre.count();
  length.then(len=>{
    
  const genre = {
    id : len+1,
    name : req.body.name
  };

 const result=validateSchema(genre);
 if(result.error)
 {
   return res.status(400).send("Please Enter Valid Data ! ");
 }
 else
 {
   const newGenre = new Genre({
     id : genre.id,
     name : genre.name
   });

   newGenre.save()
   .then(r=>{
     console.log(r);
     return res.status(200).send(newGenre);
   })
   .catch(err=>{
     console.log(err.message);
   })
 }
  })
  .catch(err=>{
    console.log(err.message);
  }) */

 /*  const genre = {
    id: genres.length + 1,
    name: req.body.name,
  };
  const result = validateSchema(genre);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  } else {
    genres.push(genre);
    res.send(genre);
    return;
  } */
});

app.put("/api/genres/:id",async (req, res) => {

  const genre= await Genre.find({_id : req.params.id});

  if(!genre)
  {
    return res.status(404).send("Not Found");
  }

  else
  {
    const g =  {
      name : req.body.name
    };
const output= validateSchema(g);
if(output.error)
{
  return res.status(400).send("Bad Request");
}
else
{
  const updatedGenre=await Genre.findByIdAndUpdate(req.params.id , g);
  console.log(updatedGenre);
  return res.send(updatedGenre);
}
  }
  /* //check for genre
  const genre = genres.find((g) => {
    return g.id == req.params.id;
  });
  //if not existes return 404
  if (!genre) {
    res.status(404).send("Not Available");
    return;
  }

  //if exists
  else {
    const newgenre = {
      id: parseInt(req.body.id),
      name: req.body.name,
    };
    const result = validateSchema(newgenre);
    //check if input is valid
    //if not show 400
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    } else {
      const index = genres.indexOf(genre);
      genres[index] = newgenre;
      res.send(newgenre);
      return;
    }
  } */
});

app.delete("/api/genres/:id", async (req, res) => {

  try{

    const genre = await Genre.find({_id :req.params.id});
  

  if(!genre)
  {
    return res.status(404).send("Not Found");
  }
  else
  {
    const result= await Genre.findByIdAndDelete(req.params.id);
    console.log(result);
    return res.send(genre);
  }
  }
  catch(err)
  {
    res.send(err.message);
    console.log(err.message);
  }


 /*  //check if id exists
  const genre = genres.find((g) => {
    return g.id == req.params.id;
  });
  if (!genre) {
    res.status(404).send("not available");
    return;
  }
  //if exists delete the record
  else {
    const index = genres.indexOf(genre);
    genres.splice(index, 1);
    res.send(genre);
    return;
  } */
});


const port=process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on port : " + port);
});
