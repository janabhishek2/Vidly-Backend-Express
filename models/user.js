const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 20,
    required: true,
  },
  numOrders: {
    type: Number,
    min: 0,
    max: 999,
    default: 0,
  },

  email: {
    type: String,
    maxlength: 255,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 1024,
  },
  phone: {
    type: String,

    minlength: 0,
    maxlength: 10,
    trim: true,
    default: "",
  },
  isGold: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: Boolean,
  addr1: {
    type: String,
    minlength: 0,
    maxlength: 50,
    default: "",
  },
  addr2: {
    type: String,
    minlength: 0,
    maxlength: 50,
    default: "",
  },
  city: {
    type: String,
    minlength: 0,
    maxlength: 20,
    default: "",
  },
  country: {
    type: String,
    minlength: 0,
    maxlength: 20,
    default: "",
  },
  zip: {
    type: String,
    minlength: 0,
    maxlength: 6,
    default: "",
  },
  customerId: {
    type: String,
    default: "",
  },
  avtar: {
    type: String,
    default: "",
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      isAdmin: this.isAdmin,
      name: this.name,
      email: this.email,
    },
    process.env.jwtPrivateKey
  );
  return token;
};
const User = mongoose.model("User", userSchema);

const joiSchema = {
  name: Joi.string().min(1).max(20).required(),
  email: Joi.string().min(5).max(255).required().email(),
  password: Joi.string().min(4).max(255).required(),
};
const updateSchema = {
  name: Joi.string().min(1).max(20).required(),
  email: Joi.string().min(5).max(255).required().email(),
  phone: Joi.string().min(0).max(10).allow(null).allow(""),
  isGold: Joi.boolean(),
  numOrders: Joi.number().min(0).max(999),

  isPhoneVerified: Joi.boolean(),
  addr1: Joi.string().min(0).max(50).allow(null).allow(""),
  addr2: Joi.string().min(0).max(50).allow(null).allow(""),
  city: Joi.string().min(0).max(20).allow(null).allow(""),
  zip: Joi.string().min(0).max(6).allow(null).allow(""),
  country: Joi.string().min(0).max(20).allow(null).allow(""),
  customerId: Joi.string().allow(null).allow(""),
  avtar: Joi.allow(null).allow(""),
};
function validateSchema(inp) {
  return Joi.validate(inp, joiSchema);
}
function validateSchemaPut(inp) {
  return Joi.validate(inp, updateSchema);
}
module.exports.User = User;
module.exports.validateSchema = validateSchema;
module.exports.validateSchemaPut = validateSchemaPut;
module.exports.userSchema = userSchema;
