const jwt = require('jsonwebtoken');

const checkTocken=(req, res, next)=>{
  const secretKey= process.env.JWT_SECRET_KEY;
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader.replace('Bearer ', '');
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.json({message: `verification fialed due to  ${err.message}`, expiry: err.message});
    } else {
      const expirationTime = decoded.exp;
      const currentTime = Math.floor(Date.now() / 1000);

      if (expirationTime < currentTime) {
        console.log('Authorization header has expired');
      } else {
        req.tokens= decoded;
        next();
      }
    }
  });
};

module.exports=checkTocken;