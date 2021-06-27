const express = require("express");
const router = express.Router();
const { Movie, validateSchema } = require("../models/movie");
const mongoose = require("mongoose");
const { Genre } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const multer = require("multer");

router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    return res.send(movies);
  } catch (err) {
    console.log(err.message);
    return;
  }
});
router.get("/orderBy/latest", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ uploadedOn: -1 });

    return res.send(movies);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something Went Wrong At Server ..");
    return;
  }
});
router.get("/orderBy/topRated", async (req, res) => {
  try {
    const movies = await Movie.find();
    const topRatedMovies = movies.filter((movie) => {
      return movie.overallRating > 0.0;
    });
    return res.status(200).send(topRatedMovies);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something Went Wrong At Server ..");
    return;
  }
});
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).send("Not Found");
    } else {
      return res.send(movie);
    }
  } catch (err) {
    console.log(err.message);
    return;
  }
});

const storageEngine = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  destination: (req, file, cb) => {
    cb(null, "./images/movies");
  },
});
const upload = multer({ storage: storageEngine });

router.post("/", [auth, admin, upload.single("tile")], async (req, res) => {
  try {
    console.log("post called");
    const movie = {
      title: req.body.title,
      genreId: req.body.genreId,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
      tile: req.file.path,
    };

    const result = validateSchema(movie);
    if (result.error) {
      return res.status(400).send(result.error);
    } else {
      const genre = await Genre.findById(movie.genreId);
      if (!genre) {
        return res.status(400).send("Invalid Genre");
      }
      const newMovie = new Movie({
        title: movie.title,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: movie.numberInStock,
        dailyRentalRate: movie.dailyRentalRate,
        tile: req.file.path,
      });

      const ans = await newMovie.save();
      console.log(ans);
      res.send(ans);
      return;
    }
  } catch (err) {
    console.log("post ", err.message);
  }
});

router.put("/:id", [auth, admin, upload.single("tile")], async (req, res) => {
  try {
    console.log("Put is called");
    console.log(req.body.ratings.length);
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).send("Movie Not Found !");
    }
    let movieTile = movie.tile;
    if (req.file && req.file.path) {
      movieTile = req.file.path;
    }

    const newMovie = {
      title: req.body.title,
      genreId: req.body.genreId,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
      tile: movieTile,
    };
    const { error } = validateSchema(newMovie);
    if (error) {
      console.log(error);
      return res.status(400).send("Bad update request");
    } else {
      const genre = await Genre.findById(newMovie.genreId);
      if (!genre) {
        return res.status(400).send("Invalid Genre");
      } else {
        let updatedMovie;

        if (req.body.ratings.length == 0) {
          updatedMovie = {
            title: newMovie.title,
            genre: {
              _id: genre._id,
              name: genre.name,
            },
            numberInStock: newMovie.numberInStock,
            dailyRentalRate: newMovie.dailyRentalRate,
            tile: movieTile,
          };
        } else {
          updatedMovie = {
            title: newMovie.title,
            genre: {
              _id: genre._id,
              name: genre.name,
            },
            numberInStock: newMovie.numberInStock,
            dailyRentalRate: newMovie.dailyRentalRate,
            tile: movieTile,
            ratings: req.body.ratings,
          };
        }

        const ans = await Movie.findByIdAndUpdate(req.params.id, updatedMovie);
        console.log(ans);
        return res.send(updatedMovie);
      }
    }
  } catch (err) {
    console.log(err);
    return;
  }
});
router.put("/deleteRating/:id", async (req, res) => {
  try {
    console.log("Delete Rating called");
    const rating = req.body.rating;
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(400).send("Movie Not Found !");
    } else {
      const ratings = [...movie.ratings];

      const ans = ratings.find((rate) => {
        return rate._id == rating._id;
      });

      const index = ratings.indexOf(ans);

      if (index == -1)
        return res.status(400).send("Rating Already Deleted ... ");
      else movie.ratings.splice(index, 1);
      console.log(movie.ratings);

      let newRating = 0;
      for (let i = 0; i < movie.ratings.length; i++) {
        newRating += movie.ratings[i].value;
      }
      if (movie.ratings.length == 0) {
        newRating = 0;
      } else {
        newRating = newRating / movie.ratings.length;
      }

      console.log("new rating", newRating);
      movie.overallRating = newRating;

      await movie.save();
      return res.status(200).send("Movie Deleted");
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).send("Something Went Wrong at server");
  }
});
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).send("Movie Not found");
    }
    const ans = await Movie.findByIdAndDelete(req.params.id);
    return res.send(ans);
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
