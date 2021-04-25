const express=require('express');

const app=express();
const customers=require('./routes/customers');
const genres=require('./routes/genres');
const movies=require('./routes/movies');
const rentals=require('./routes/rentals');
const users=require('./routes/users');
const  auth=require('./routes/auth');
const config=require('config');

if(!config.get('jwtPrivateKey'))
{
  console.error("jwtPrivateKey not set !");
  process.exit(1);
}
app.use(express.json());

app.use('/api/customers',customers);
app.use('/api/genres',genres);
app.use('/api/movies',movies);
app.use('/api/rentals',rentals);
app.use('/api/users',users);
app.use('/api/auth',auth);

app.get('/',(req,res)=>{
    res.send("Ok"); 
});

const port=process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Listening on port : " + port);
});