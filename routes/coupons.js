const express = require("express");
const mongoose = require("mongoose");
const { Rental } = require("../models/rental");

const router = express.Router();

const { Coupon, validate } = require("../models/coupon");

router.get("/", async (req, res) => {
  try {
    res.status(200).send("OK");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something Went Wrong");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const couponId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).send("Invalid Coupon Id..");
    } else {
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        res.status(404).send("Coupon not found");
      } else res.status(200).send(coupon);
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something Went wrong");
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid User Id..");
    }
    const coupons = await Coupon.find({ userId: req.params.id });

    if (!coupons) {
      return res.status(404).send("No Coupons Found");
    } else res.status(200).send(coupons);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something Went wrong");
  }
});

router.post("/", async (req, res) => {
  try {
    let rentals = await Rental.find();
    rentals = rentals.filter((rental) => {
      return rental.user._id == req.body.userId;
    });
    console.log(rentals);

    if (!rentals) {
      return res.status(404).send("Rentals Not Found");
    } else {
      let total = 0;
      rentals.forEach((rental) => {
        total += rental.incomeFromRental;
      });
      total /= rentals.length;

      //validate input
      const { error } = validate(req.body);
      if (error) {
        return res.status(400).send("Invalid Data");
      }
      const currDate = new Date();
      const ext = new Date();
      ext.setDate(currDate.getDate() + 60);

      //create data for model
      const coupon = new Coupon({
        userId: req.body.userId,
        value: total,
        issuedOn: currDate,
        expiry: ext,
      });

      const out = await coupon.save();
      res.status(200).send(out);
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something Went wrong");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const couponId = req.params.id;
    const movieId = req.body.movieId;
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).send("Invalid Coupon Id..");
    }
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      res.status(400).send("Invalid Coupon id");
    }

    if (coupon.isUsed) {
      return res.status(400).send("Coupon already used");
    }
    coupon.isUsed = true;
    coupon.movieId = movieId;

    const out = await coupon.save();

    res.status(200).send(out);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something Went wrong");
  }
});
module.exports = router;
