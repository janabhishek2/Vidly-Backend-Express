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

router.get("/", async (req, res) => {
  try {
    const rentals = await Rental.find();

    return res.send(rentals);
  } catch (err) {
    console.log(err.message);
    return;
  }
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

router.post("/", async (req, res) => {
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

    const idempotency_key = uuidv4();
    const { token } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });
    token.card.address_line1 = user.addr1;
    token.card.address_line2 = user.addr1;
    token.card.address_city = user.city;
    token.card.address_country = user.country;
    token.card.address_zip = user.zip;
    console.log(token);
    const charge = await stripe.charges.create(
      {
        amount: movie.dailyRentalRate * 30 * 100,
        currency: "inr",
        customer: customer.id,
        receipt_email: token.email,
        description: `Purchased the ${movie.title}`,
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip,
          },
        },
      },
      {
        idempotencyKey: idempotency_key,
      }
    );
    console.log(charge);
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
      uuidKey: idempotency_key.toString(),
      description: `Purchased the ${movie.title}`,
      userIP: token.client_ip.toString(),
    });

    if (movie.numberInStock == 0) {
      return res.status(400).send("Movie not in stock");
    }
    const ans = await newRental.save();
    res.send(ans);

    movie.numberInStock--;
    const ans1 = await movie.save();

    user.numOrders++;
    await user.save();
    return;
  } catch (err) {
    console.log(err.message);
    return;
  }
});
/* router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid Renatal");
    }
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      res.status(404).send("Rental Not Found !");
      return;
    }
    const { error } = validateSchema(req.body);
    if (error) {
      return res.status(400).send("Bad Request");
    }
    if (rental.returned == true) {
      return res.status(400).send("Movie Already Returned !");
    }
    if (req.body.returned == true && rental.returned == false) {
      rental.returned = true;
      const today = new Date();
      rental.dateReturned = today;
      const days = (today.getTime() - rental.dateOut) / (1000 * 60 * 60 * 24);
      const money = days * rental.rentalRate;
      rental.incomeFromRental = money;
    }

    await rental.save();
    return res.send(rental);
  } catch (err) {
    console.log(err.message);
  }
}); */

module.exports = router;
