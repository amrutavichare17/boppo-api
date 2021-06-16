const express = require('express');
const app = express();
const mongoose = require('mongoose');


app.use(function (req, res, next) {

    const allowedOrigins = ['https://www.boppotechnologies.com/', 'https://boppotechnologies.com/'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
         res.setHeader('Access-Control-Allow-Origin', origin);
    }else{
      res.setHeader('Access-Control-Allow-Origin', 'https://boppotechnologies.com/');
    }
  
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'authorization,X-Requested-With,content-type');
  
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    // Pass to next layer of middleware
    next();
  });
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  // Listen On port
  var startListning = () => {
    app.listen(process.env.PORT || 8089, () => console.log('server started'+ 8089));
    mongoose.set("debug",true);
  };
  // Router Config
  var ROOT_PATH = "/api";
  const userConfig = require('./routes/userrouter');
  app.use( ROOT_PATH + '/user', userConfig);
   mongoose.connect("mongodb://localhost:27017/boppo", { useNewUrlParser: true })
 // Connect with database
  //mongoose.connect("mongodb+srv://amruta:antarctica@123@antarctica.sr90e.mongodb.net/antarctica?retryWrites=true&w=majority", { useNewUrlParser: true })
  const db = mongoose.connection
  db.on('error', (error) => console.error(error))
  db.once('open', startListning )