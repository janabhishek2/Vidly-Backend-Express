const express = require("express");
const mongoose = require("mongoose");

const app = express();
require("dotenv").config();
const customers = require("./routes/customers");
const genres = require("./routes/genres");
const movies = require("./routes/movies");
const rentals = require("./routes/rentals");
const paymentMethods = require("./routes/paymentMethods");
const users = require("./routes/users");
const coupons = require("./routes/coupons");
const auth = require("./routes/auth");
const config = require("config");

if (!process.env.jwtPrivateKey) {
  console.error("jwtPrivateKey not set !");
  process.exit(1);
}
mongoose
  .connect("mongodb://localhost:27017/Vidly_Node", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Connected to DB...");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use(express.json());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use("/api/customers", customers);
app.use("/api/genres", genres);
app.use("/api/movies", movies);
app.use("/api/rentals", rentals);
app.use("/api/users", users);
app.use("/api/coupons", coupons);
app.use("/api/paymentMethods", paymentMethods);
app.use("/api/auth", auth);
app.use("/images", express.static("images"));

app.get("/", (req, res) => {
  res.send("Ok");
});
console.log(process.env.jwtPrivateKey);
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("Listening on port : " + port);
});
