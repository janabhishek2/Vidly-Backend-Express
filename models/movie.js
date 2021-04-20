const Joi=require('joi');
const mongoose=require('mongoose');
const {genreSchema}=require('./genre');
const movieSchema=new mongoose.Schema({
    title: {
        type: String,
        required:true,
        minlength:1,
        maxlength:255
    },
    genre: {
        type : genreSchema,
        required:true
    },
    numberInStock : {
        type: Number,
        required:true,
        min:0,
        max:255
    },
    dailyRentalRate: {
        type: Number,
        required:true,
        min:1,
        max:255
    }
});
const Movie= mongoose.model('Movie', movieSchema);
const joiSchema={
    title: Joi.string().required().min(1),
    genreId : Joi.string().required(),
    numberInStock:Joi.number().required(),
    dailyRentalRate: Joi.number().required()
}

function validateSchema(inp)
{
    return Joi.validate(inp,joiSchema);
}
module.exports.Movie=Movie;
module.exports.movieSchema=movieSchema;
module.exports.validateSchema=validateSchema;