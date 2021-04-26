const jwt=require('jsonwebtoken');
const config=require('config');

function auth(req,res,next)
{
    try{
        const token=req.header('x-auth-token');
        if(!token) return res.status(401).send("Access Denied, No token provided");
        const decoded=jwt.verify(token,config.get('jwtPrivateKey'));
        req.user=decoded;
        next();
    }
    catch(err)
    {
        return res.status(400).send("Invalid token");
    }
   
}
module.exports=auth;