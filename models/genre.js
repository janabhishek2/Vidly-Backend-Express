const Joi = require("joi");
const mongoose=require('mongoose');

const genreSchema=new mongoose.Schema({
    name : {
      type :String,
      required :true,
      trim :true,
      maxlength:20,
      minlength :3
    }
  })
  
  const Genre = mongoose.model('Genre',genreSchema);

  const schema = {
    name: Joi.string().min(3).max(20).required(),
  };
  
  function validateSchema(inp) {

    const res=  Joi.validate(inp,joiSchema);
    const objectValidation=mongoose.Types.ObjectId.isValid(inp.customerId) && mongoose.Types.ObjectId.isValid(inp.movieId);
    if(!objectValidation)
    {
        res.error+="ObjectId is not Correct";
    }
    return res;
  }

  module.exports.Genre=Genre,
  module.exports.validateSchema=validateSchema;
  module.exports.genreSchema=genreSchema;