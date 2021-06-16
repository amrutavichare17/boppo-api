const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var empSchema=mongoose.Schema({
    userId :{
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    employeeID:{
        type:String,
        required:true
    },
    organizationName:{
        type:String,
        required:true
    },
    createdDate:{
        type: Date,
        default: Date.now
    }
});
empSchema.index({
    employeeID: 1,
    organizationName: 1,
  }, {
    unique: true, sparse:true
  });
module.exports=mongoose.model('employee', empSchema);