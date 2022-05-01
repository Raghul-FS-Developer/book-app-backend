const mongoose = require('mongoose')
const {Schema} = mongoose

const book = new Schema({
   
    category:{
        type:String,
        required:[true ,'book category is required']
    },
    author:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    booklink:{
        type:String
    },
    createdBy:{
        type:String,
        required:true
    }
},{
    timestamps:true
})


module.exports=mongoose.model('book',book)