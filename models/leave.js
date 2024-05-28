const mongoose = require('mongoose')

const leaveSchema = mongoose.Schema({
    employeeName:{
        type: String,
        required:true
    },
    startDate:{
        type:String,
        required:true
    },
    endDate:{
        type:String, 
        required:true      
    },
    reason:{
        type:String,
        required:true
    },
    employeeId: {
        type: mongoose.Types.ObjectId,
        required:true
    },
    approved: {
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = mongoose.model('leave',leaveSchema)