const express=require('express');

const app=express();
const customers=require('./routes/customers');
const genres=require('./routes/genres');
const movies=require('./routes/movies');
app.use(express.json());

app.use('/api/customers',customers);
app.use('/api/genres',genres);
app.use('/api/movies',movies);
app.get('/',(req,res)=>{
    res.send("Ok"); 
})
const port=process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Listening on port : " + port);
});