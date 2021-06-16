const mongoose = require('mongoose');

var userSchema=mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required:true
    },
    emailId:{
        type:String,
        required:true      
    },
    password:{
        type:String,
        select: false 
    },
    createdDate:{
        type: Date,
        default: Date.now
    }
});
module.exports=mongoose.model('user', userSchema);