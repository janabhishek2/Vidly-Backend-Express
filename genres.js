const express = require("express");
const app = express();
const Joi = require("joi");
app.use(express.json());

const genres = [
  { id: 1, name: "Action" },
  { id: 2, name: "Comedy" },
  { id: 3, name: "Horror" },
  { id: 4, name: "SciFi" },
  { id: 5, name: "Romance" },
];

app.get("/api/genres", (req, res) => {
  res.send(genres);
});

app.get("/api/genres/:id", (req, res) => {
  const genre = genres.find((g) => {
    return g.id == req.params.id;
  });
  if (!genre) {
    return res.status(404).send("Not  Found");
  } else {
    res.send(genre);
  }
});
const schema = {
  id: Joi.number(),
  name: Joi.string().min(3).max(20).required(),
};
function validateSchema(inp) {
  return Joi.validate(inp, schema);
}
app.post("/api/genres", (req, res) => {
  const genre = {
    id: genres.length + 1,
    name: req.body.name,
  };
  const result = validateSchema(genre);
  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  } else {
    genres.push(genre);
    res.send(genre);
    return;
  }
});

app.put("/api/genres/:id", (req, res) => {
  //check for genre
  const genre = genres.find((g) => {
    return g.id == req.params.id;
  });
  //if not existes return 404
  if (!genre) {
    res.status(404).send("Not Available");
    return;
  }

  //if exists
  else {
    const newgenre = {
      id: parseInt(req.body.id),
      name: req.body.name,
    };
    const result = validateSchema(newgenre);
    //check if input is valid
    //if not show 400
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    } else {
      const index = genres.indexOf(genre);
      genres[index] = newgenre;
      res.send(newgenre);
      return;
    }
  }
});

app.delete("/api/genres/:id", (req, res) => {
  //check if id exists
  const genre = genres.find((g) => {
    return g.id == req.params.id;
  });
  if (!genre) {
    res.status(404).send("not available");
    return;
  }
  //if exists delete the record
  else {
    const index = genres.indexOf(genre);
    genres.splice(index, 1);
    res.send(genre);
    return;
  }
});
app.listen(3000, () => {
  console.log("Listening on 3000");
});
