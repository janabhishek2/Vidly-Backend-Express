const mongoose = require("mongoose");
const Joi = require("joi");

const couponSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  expiry: {
    type: Date,
    required: true,
  },
  issuedOn: {
    type: Date,
    required: true,
  },
  value: {
    type: Number,
    max: 500,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  movieId: {
    type: String,
    default: "",
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);

const joiSchema = {
  userId: Joi.string().required(),
};

const validate = (inp) => {
  return Joi.validate(inp, joiSchema);
};

module.exports.Coupon = Coupon;
module.exports.validate = validate;
