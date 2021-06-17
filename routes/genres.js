const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const mongoose = require("mongoose");
const { Genre, validateSchema } = require("../models/genre");

const genres = [
  { id: 1, name: "Action" },
  { id: 2, name: "Comedy" },
  { id: 3, name: "Horror" },
  { id: 4, name: "SciFi" },
  { id: 5, name: "Romance" },
];

async function oneTime() {
  //call me to reset genres collection

  const gens = await Genre.find();
  gens.forEach(async (g) => {
    try {
      const res = await Genre.deleteOne({ _id: g._id });
      console.log(res);
    } catch (err) {
      console.log(err.message);
    }
  });

  genres.forEach((g) => {
    const temp = new Genre({
      name: g.name,
    });

    temp
      .save()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err.message);
      });
  });
}
router.get("/", (req, res) => {
  const gs = Genre.find()
    .then((r) => {
      res.send(r);
    })
    .catch((err) => {
      console.log(err.message);
    });
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).send("Invalid Genre ID");
    }
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      res.status(404).send("Genre not found");
    }
    res.send(genre);
    return;
  } catch (err) {
    console.log(err.message);
  }
});

/* const genre = genres.find((g) => {
    return g.id == req.params.id;
  });
  if (!genre) {
    return res.status(404).send("Not  Found");
  } else {
    res.send(genre);
  } */

router.post("/", async (req, res) => {
  try {
    const genre = {
      name: req.body.name,
    };

    const result = validateSchema(genre);

    if (result.error) {
      return res.status(400).send("Invalid Input");
    } else {
      const newGenre = new Genre({
        name: genre.name,
      });

      const result = await newGenre.save();
      console.log(res);
      return res.send(result);
    }
  } catch (err) {
    res.status(400).send("bad request");
    console.log(err.message);
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

router.put("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid Genre ID");
  }
  const genre = await Genre.findById(req.params.id);

  if (!genre) {
    return res.status(404).send("Not Found");
  } else {
    const g = {
      name: req.body.name,
    };
    const output = validateSchema(g);
    if (output.error) {
      return res.status(400).send("Bad Request");
    } else {
      const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, g);
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

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).send("Invalid Genre ID");
    }
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).send("Not Found");
    } else {
      await Genre.findByIdAndDelete(req.params.id);

      return res.send(genre);
    }
  } catch (err) {
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

module.exports = router;
