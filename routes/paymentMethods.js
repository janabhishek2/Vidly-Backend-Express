const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.stripeSecretKey);
require("dotenv").config();
const express = require("express");
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const pms = await stripe.paymentMethods.list({
      customer: req.params.id,
      type: "card",
    });
    res.status(200).send(pms);
  } catch (err) {
    console.log(err.message);
  }
});
module.exports = router;
