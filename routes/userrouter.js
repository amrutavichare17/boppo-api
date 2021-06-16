const express = require('express')
const router = express.Router()
const User = require('../schema/user');
const Employee = require('../schema/employee');
var jwtFunctions= require('../model/jwtfun.js');
var crypto = require('crypto');

var invalidRequestError={
    "name":"INVALID_REQUEST",
    "code":"INVALID_REQUEST",
    "msg" : "your request has been rejected due to invalid request parameters",
    "status":"error"
};
var userCreateError={
    "name":"ERROR_IN_USER_CREATE",
    "code":"ERROR_IN_USER_CREATE",
    "msg" : "Oops!! Something went wrong while creating user. Please contact support.",
    "status":"error"
};
var userAlreadyExsist={
    "name":"ERROR_USER_ALREADY_EXSIST",
    "code":"ERROR_USER_ALREADY_EXSIST",
    "msg" : "Email Id already exsist",
    "status":"error"
};
var userAlreadyExsistForEmployeeId={
    "name":"ERROR_EMPLOYEE_ALREADY_EXSIST",
    "code":"ERROR_EMPLOYEE_ALREADY_EXSIST",
    "msg" : "Employee Id already exsist",
    "status":"error"
}
var loginError={
    "name":"USER_NOT_FOUND",
    "status":"error",
    "message":"Username or password incorrect",
    "code":"USER_NOT_FOUND"
};

var passwordNotValid={
    "name":"PASSWORD_NOT_VALID",
    "status":"error",
    "message":"Password must be between 6 to 16 character must be contain atleast one number and one special character",
    "code":"PASSWORD_NOT_VALID"
}
var emailNotValid={
    "name":"EMAIL_ID_NOT_VALID",
    "status":"error",
    "message":"Please add valid email Id",
    "code":"EMAIL_ID_NOT_VALID"
};
// In validateSignup method validation for register user api is done
const validateSignUp= async(req,res,next)=>{
    //Is request parameters are valid
    if( !req.body.emailId || !req.body.password || !req.body.firstName || !req.body.lastName || !req.body.employeeID || !req.body.organizationName){
        var invalidRequestError={
            "status":"error",
            "name":"INVALID_REQUEST",
            "code":"50069",
            "msg" : "your request has been rejected due to invalid request parameters"
        };
        res.send(invalidRequestError);
        return;
        //rejecting request if invalid parameters
    }
    // Check email is valid or not
    var email=req.body.emailId;
    var emailRegularExpression=/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if(!emailRegularExpression.test(email)){
        res.send(emailNotValid);
        return;
    }

    // Convert Base 64 password to normal string 
    // Password validation using regular expression. Password must be between 6 to 16 character must be contain atleast one number and one special character
    var originalPassword = new Buffer.from(new Buffer.from(req.body.password, 'base64').toString("ascii"),'base64').toString("ascii");
    var passwordrExpression=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if(!passwordrExpression.test(originalPassword)){
        res.send(passwordNotValid);
        return;
    }
    next();
}
router.post('/register',validateSignUp, async (req, res) => {
        // Convert password from base64 to md5 
        var originalPassword = new Buffer.from(new Buffer.from(req.body.password, 'base64').toString("ascii"),'base64').toString("ascii");
        var passwordHash = crypto.createHash('md5').update(originalPassword).digest("hex");
        var email=req.body.emailId;
        var userRes = await User.findOne({ 'emailId' : email });
        if(userRes){
            res.send(userAlreadyExsist);
            return;
        }
        var empRes = await Employee.findOne({ 'employeeID' : req.body.employeeID, 'organizationName' : req.body.organizationName});
        if(empRes){
            res.send(userAlreadyExsistForEmployeeId);
            return;
        }
        const user = new User(req.body);
        user.password=passwordHash;
        var emp= new Employee({
            "employeeID":req.body.employeeID,
            "organizationName":req.body.organizationName
        })
        try {
            const newuser = await user.save();
            emp.userId=newuser._id;
            const newemployee= await emp.save();
            if(newuser){
                res.status(200).json({"message":"Employee register successfully","res":newuser});
            
            }else{
                res.status(200).json(userCreateError)
            }
        } catch (e) {
            console.log(e);
            res.status(200).json(userCreateError)
        }   
});

const validateLogin= async (req, res,next) => {
    //console.log(req);
    if( !req.body.emailId || !req.body.password){
                
        res.send(invalidRequestError);
        return;
        //rejecting request if invalid parameters
    }
    var email=req.body.emailId;
    var emailRegularExpression=/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if(!emailRegularExpression.test(email)){
        res.send(emailNotValid);
        return;
    }

    next();

}
router.post('/login',validateLogin, async (req, res) => {
    // Convert password from base64 to md5 
    var originalPassword = new Buffer.from(new Buffer.from(req.body.password, 'base64').toString("ascii"),'base64').toString("ascii");
    var passwordHash = crypto.createHash('md5').update(originalPassword).digest("hex");
    var email=req.body.emailId;
    
    var oo={ 'emailId' : email,'password': passwordHash.toString("ascii")};
  
    try {
        var userRes = await User.findOne(oo);
        console.log(userRes);
        if(userRes){
            var token=await jwtFunctions.createJWTToken(userRes);
            console.log(token);
            userRes=userRes.toJSON();
            userRes.token=token;
            res.status(200).send(userRes)
        }else{
            res.status(200).json(loginError)
        }
       
    } catch (e) {
        res.status(200).json(loginError)
    }
})

module.exports = router;