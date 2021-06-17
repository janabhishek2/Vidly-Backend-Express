const express = require("express");
const mongoose = require("mongoose");
const { Customer, validateSchema } = require("../models/customer");
const router = express.Router();
const auth = require("../middleware/auth");

async function oneTime() {
  try {
    const customers = await Customer.find();
    customers.forEach(async (c) => {
      const res = await Customer.deleteOne({ _id: c._id });
      console.log(res);
    });
  } catch (err) {
    console.log(err.message);
  }
}

router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.send(customers);
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.find({ _id: req.params.id });
    if (customer.length == 0) {
      res.status(404).send("Not Found");
      return;
    } else {
      res.send(customer);
      return;
    }
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const customer = {
      isGold: req.body.isGold,
      name: req.body.name,
      phone: req.body.phone,
    };

    const ans = validateSchema(customer);
    if (ans.error) {
      return res.status(400).send(ans.error.details);
    } else {
      const newCustomer = new Customer({
        isGold: customer.isGold,
        name: customer.name,
        phone: customer.phone,
      });

      const ans = await newCustomer.save();
      console.log(ans);
      return res.send(ans);
    }
  } catch (err) {
    console.log(err.message);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.find({ _id: req.params.id });

    if (customer.length == 0) {
      console.log(customer);
      return res.status(404).send("Not Found");
    } else {
      const cust = {
        isGold: req.body.isGold,
        name: req.body.name,
        phone: req.body.phone,
      };
      const ans = validateSchema(cust);
      if (ans.error) {
        return res.status(400).send("Bad request");
      } else {
        const updatedCustomer = await Customer.findByIdAndUpdate(
          req.params.id,
          cust
        );
        return res.send(cust);
      }
    }
  } catch (err) {
    console.log(err.message);
    return;
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.find({ _id: req.params.id });
    if (customer.length == 0) {
      return res.status(404).send("Not Found");
    } else {
      const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
      console.log(deletedCustomer);
      return res.send(deletedCustomer);
    }
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
