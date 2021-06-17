const express = require("express");
const router = express.Router();
const { User, validateSchema, validateSchemaPut } = require("../models/user");
const _ = require("lodash");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");

mongoose
  .connect("mongodb://localhost/Vidly_Node")
  .then((res) => {
    console.log("Connected to DB...");
  })
  .catch((err) => {
    console.log(err.message);
  });

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.send(users);
  } catch (err) {
    console.log(err.message);
  }
});
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid User Id");
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send("User Not Found!");
    }
    /*   res.send(_.pick(user, ["name", "email", "_id"])); */
    res.send(user);
  } catch (err) {
    console.log(err.message);
    return;
  }
});
router.post("/", async (req, res) => {
  try {
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    const { error } = validateSchema(user);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    let newUser = await User.findOne({ email: req.body.email });
    if (newUser) {
      return res.status(400).send("User already exists");
    }
    newUser = new User({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const salt = await bcrypt.genSalt(11);
    const hashed = await bcrypt.hash(newUser.password, salt);
    newUser.password = hashed;

    await newUser.save();
    const token = newUser.generateAuthToken();
    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(newUser, ["_id", "name", "email"]));
    return;
  } catch (err) {
    console.log(err.message);
    res.status(400).send("Bad Request");
    return;
  }
});

router.put("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid User Id");
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send("User Not Found!");
    }

    const { error } = validateSchemaPut(req.body);
    if (error) {
      res.status(400).send(error);
      console.log(error.details);
    } else {
      const properties = Object.keys(req.body);
      properties.forEach((property) => {
        user[property] = req.body[property];
      });
      const result = await user.save();
      console.log(result);
      res.send(result);
    }
  } catch (err) {
    console.log(err.message);
  }
});
module.exports = router;
