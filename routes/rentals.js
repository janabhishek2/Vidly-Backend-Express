const mongoose = require("mongoose");
const { Rental, validateSchema } = require("../models/rental");
require("dotenv").config();
const express = require("express");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const router = express.Router();
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(process.env.stripeSecretKey);
const { Coupon } = require("../models/coupon");

router.get("/", async (req, res) => {
  try {
    const rentals = await Rental.find();

    return res.send(rentals);
  } catch (err) {
    console.log(err.message);
    return;
  }
});
router.get("/getPaymentIntent", async (req, res) => {
  const user = await User.findById(req.body.userId);
  const movie = await Movie.findById(req.body.movieId);

  if (!user || !movie) {
    return res.status(404).send("Customer or movie not found!");
  }
  let retDate = new Date();
  retDate = retDate.setDate(retDate.getDate() + 30);

  const customer = await stripe.customers.create();

  // Create a PaymentIntent with the order amount and currency

  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,

    setup_future_usage: "off_session",

    amount: movie.dailyRentalRate * 30,

    currency: "inr",
  });
  res.send(paymentIntent.client_secret);
});
router.get("/user/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid User Id");
    }
    const allRentals = await Rental.find({});
    const rentals = allRentals.filter((item) => {
      return item.user["_id"] == req.params.id;
    });
    res.send(rentals);
  } catch (err) {
    console.log(err.message);
  }
});
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid Movie Id");
    }
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).send("Rental Not Found");
    } else {
      res.send(rental);
      return;
    }
  } catch (err) {
    console.log(err.message);
    return;
  }
});

router.post("/create-payment-intent", async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    const movie = await Movie.findById(req.body.movieId);

    if (!user || !movie) {
      return res.status(404).send("Customer or movie not found!");
    }
    if (movie.numberInStock == 0) {
      return res.status(404).send("Movie Out Of stock..");
    }
    let retDate = new Date();
    retDate = retDate.setDate(retDate.getDate() + 30);

    if (user.customerId == "") {
      const customer = await stripe.customers.create({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
      user.customerId = customer.id;

      await user.save();
      const paymentIntent = await stripe.paymentIntents.create({
        customer: customer.id,

        setup_future_usage: "off_session",

        amount: movie.dailyRentalRate * 30 * 100,

        currency: "inr",
        payment_method_types: ["card"],
      });
      const ans = paymentIntent.client_secret;

      res.send(ans);
    } else {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.customerId,
        type: "card",
      });
      console.log("Payment Method", paymentMethods);
      const paymentIntent = await stripe.paymentIntents.create({
        customer: user.customerId,

        setup_future_usage: "off_session",

        amount: movie.dailyRentalRate * 30 * 100,

        currency: "inr",
      });
      console.log("payment intent", paymentIntent);
      const ans = paymentIntent.client_secret;

      res.send(ans);
    }
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/createRental", async (req, res) => {
  try {
    /*  const { error } = validateSchema(req.body);
    if (error) {
      return res.status(400).send("Incorrect Data");
    } */
    /* const objectValidation=mongoose.Types.ObjectId.isValid(rental.customerId) && mongoose.Types.ObjectId.isValid(rental.movieId);
        if(!objectValidation)
        {
            return res.status(400).send("Incorrect Data");
        } */
    const user = await User.findById(req.body.userId);
    const movie = await Movie.findById(req.body.movieId);

    if (!user || !movie) {
      return res.status(404).send("Customer or movie not found!");
    }
    let retDate = new Date();
    retDate = retDate.setDate(retDate.getDate() + 30);

    const newRental = new Rental({
      user: {
        _id: user._id,
        email: user.email,
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate,
      },
      rentalRate: movie.dailyRentalRate,
      expiresOn: retDate,
      incomeFromRental: movie.dailyRentalRate * 30,
      currency: "inr",

      description: `Purchased the ${movie.title}`,
      customerPaymentId: user.customerId,
      paymentMethodId: req.body.paymentMethodId,
      paymentMethodName: req.body.paymentMethodName,
    });

    const ans = await newRental.save();

    movie.numberInStock--;
    const ans1 = await movie.save();

    user.numOrders++;
    await user.save();
    //coupon code
    if (user.numOrders % 20 == 0) {
      let rentals = await Rental.find();
      rentals = rentals.filter((rental) => {
        return rental.user._id == req.body.userId;
      });

      let total = 0;
      rentals.forEach((rental) => {
        total += rental.incomeFromRental;
      });
      total /= rentals.length;

      //validate input

      const currDate = new Date();
      const ext = new Date();
      ext.setDate(currDate.getDate() + 60);

      //create data for model
      const coupon = new Coupon({
        userId: user._id,
        value: total,
        issuedOn: currDate,
        expiry: ext,
      });

      const out = await coupon.save();
      return res.status(200).send(out);
    }

    return res.status(200).send(ans);
  } catch (err) {
    console.log(err.message);
    return;
  }
});

router.post("/freeRental", async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    const movie = await Movie.findById(req.body.movieId);
    const coupon = await Coupon.findById(req.body.couponId);

    if (!user || !movie) {
      return res.status(404).send("Customer or movie not found!");
    }
    let retDate = new Date();
    retDate = retDate.setDate(retDate.getDate() + 30);

    const newRental = new Rental({
      user: {
        _id: user._id,
        email: user.email,
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate,
      },
      rentalRate: 0,
      expiresOn: retDate,
      incomeFromRental: 0,
      currency: "inr",

      description: `Used Coupon for ${movie.title}`,
      customerPaymentId: coupon._id,
      paymentMethodId: coupon._id,
      paymentMethodName: "Coupon",
    });

    const ans = await newRental.save();
    res.send(ans);

    movie.numberInStock--;
    await movie.save();

    return;
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something went wrong !");
  }
});
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).send("Invalid Rental Id");
      return;
    } else {
      ///change rating and comments only(updated movie model as well)

      const rental = await Rental.findById(req.params.id);
      if (!rental) {
        return res.status(404).send("Rental Not Found!");
      }
      rental.rating = req.body.rating;
      rental.comments = req.body.comments;

      await rental.save();
      const movieId = rental.movie._id;
      const userId = rental.user._id;

      const movie = await Movie.findById(movieId);
      const user = await User.findById(userId);
      if (!movie || !user) {
        res.status(404).send("Movie Not Found !");
        return;
      }
      const newRating = {
        rentalId: rental._id,
        userId: userId,
        value: req.body.rating,
        comments: req.body.comments,
        userAvtar: user.avtar,
        userName: user.name,
      };

      const existingRating = movie.ratings.find((rating) => {
        return rating.rentalId.toString() == rental._id.toString();
      });

      if (existingRating) {
        const index = movie.ratings.indexOf(existingRating);
        movie.ratings[index] = newRating;
        let recalculatedRating = 0;
        movie.ratings.forEach((rating) => {
          recalculatedRating += rating.value;
        });
        recalculatedRating = recalculatedRating / movie.ratings.length;
        movie.overallRating = recalculatedRating;
        await movie.save();
        return res.status(200).send("Movie Updated !");
      }
      movie.ratings.push(newRating);
      let recalculatedRating = 0;
      movie.ratings.forEach((rating) => {
        recalculatedRating += rating.value;
      });
      recalculatedRating = recalculatedRating / movie.ratings.length;
      movie.overallRating = recalculatedRating;
      await movie.save();
      return res.status(200).send("Movie Updated !");
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Something Went Wrong !");
  }
});
module.exports = router;
