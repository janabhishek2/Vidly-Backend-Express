const mongoose = require("mongoose");
const Joi = require("joi");
const { customerSchema } = require("./customer");
const { userSchema } = require("./user");
const rentalSchema = new mongoose.Schema({
  user: {
    type: new mongoose.Schema({
      _id: mongoose.Schema.Types.ObjectId,
      email: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
      },
    }),
    required: true,
  },
  movie: {
    type: new mongoose.Schema({
      _id: mongoose.Schema.Types.ObjectId,
      title: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 1,
        max: 255,
      },
    }),
    required: true,
  },
  dateOut: {
    type: Date,
    default: Date.now,
    required: true,
  },
  rentalRate: {
    type: Number,
  },
  incomeFromRental: {
    type: Number,
    default: 0,
  },

  expiresOn: {
    type: Date,
    required: true,
  },
  currency: {
    type: String,
    maxlength: 10,
    required: true,
  },

  description: {
    type: String,
    maxlength: 256,
    required: true,
  },
  customerPaymentId: {
    type: String,
    required: true,
  },
  paymentMethodId: {
    type: String,
    required: true,
  },
  paymentMethodName: {
    type: String,
    required: true,
  },
  rating: {
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
});

const Rental = mongoose.model("Rental", rentalSchema);

const joiSchema = {
  userId: Joi.string().required(),
  movieId: Joi.string().required(),
};

function validateSchema(inp) {
  const res = Joi.validate(inp, joiSchema);
  const objectValidation =
    mongoose.Types.ObjectId.isValid(inp.userId) &&
    mongoose.Types.ObjectId.isValid(inp.movieId);
  if (!objectValidation) {
    res.error += "ObjectId is not Correct";
  }
  return res;
}

module.exports.Rental = Rental;
module.exports.validateSchema = validateSchema;
module.exports.rentalSchema = rentalSchema;
