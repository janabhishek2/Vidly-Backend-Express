const mongoose=require('mongoose');
const Joi=require('joi');
const {customerSchema}=require('./customer');

const rentalSchema= new mongoose.Schema({

    customer:{
        type:customerSchema,
        required: true
    },
    movie : {
        type: new mongoose.Schema({
            title: {
                type: String,
                required:true,
                minlength:1,
                maxlength:255
            },
            dailyRentalRate: {
                type: Number,
                required:true,
                min:1,
                max:255
            }
        }),
        required: true
    },
    dateOut:{
        type : Date,
        default :Date.now,
        required :true
    },
    dateReturned :{
        type :Date
    },
    rentalRate:{
        type :Number
    },
    incomeFromRental:{
        type:Number,
        default:0
    },
    returned:{
        type:Boolean,
        default:false
    }
});

const Rental = mongoose.model('Rental',rentalSchema);

const joiSchema={
    customerId:Joi.string().required(),
    movieId : Joi.string().required(),  
    returned:Joi.boolean()
}

function validateSchema(inp)
{
    const res=  Joi.validate(inp,joiSchema);
    const objectValidation=mongoose.Types.ObjectId.isValid(inp.customerId) && mongoose.Types.ObjectId.isValid(inp.movieId);
    if(!objectValidation)
    {
        res.error+="ObjectId is not Correct";
    }
    return res;
  
}

module.exports.Rental=Rental;
module.exports.validateSchema=validateSchema;
module.exports.rentalSchema=rentalSchema;