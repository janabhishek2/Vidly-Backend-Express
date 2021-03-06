const mongoose = require("mongoose");
const express = require("express");
const { User } = require("../models/user");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send("Invalid Email or password");
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("Invalid Email or password");
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).send("Invalid Email or password");
    }
    const token = user.generateAuthToken();
    res.send(token);
  } catch (err) {
    console.log(err);
    return;
  }
});

function validate(user) {
  const joiSchema = {
    email: Joi.string().email().min(3).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
  };
  return Joi.validate(user, joiSchema);
}
module.exports = router;
