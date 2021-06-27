const Joi = require("joi");
const mongoose = require("mongoose");
const { genreSchema } = require("./genre");
const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
  },
  genre: {
    type: genreSchema,
    required: true,
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 1,
    max: 255,
  },
  tile: {
    type: String,
    default: "",
  },
  uploadedOn: {
    type: Date,
    default: Date.now,
  },
  ratings: [
    new mongoose.Schema({
      rentalId: mongoose.Schema.Types.ObjectId,
      userId: mongoose.Schema.Types.ObjectId,
      userName: {
        type: String,
      },
      userAvtar: {
        type: String,
      },
      value: {
        type: Number,
        min: 0,
        max: 5,
      },
      comments: {
        type: String,
        minlength: 0,
        maxlength: 100,
        default: "",
      },
    }),
  ],
  overallRating: {
    type: Number,
    default: 0,
  },
});
const Movie = mongoose.model("Movie", movieSchema);
const joiSchema = {
  title: Joi.string().required().min(1),
  genreId: Joi.string().required(),
  numberInStock: Joi.number().required(),
  dailyRentalRate: Joi.number().required(),
  tile: Joi.string().allow(""),
  uploadedOn: Joi.date(),
};

function validateSchema(inp) {
  const res = Joi.validate(inp, joiSchema);

  return res;
}
module.exports.Movie = Movie;
module.exports.movieSchema = movieSchema;
module.exports.validateSchema = validateSchema;
