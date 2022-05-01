var mongoose = require('mongoose')
const {Schema} = mongoose;
var validator = require('validator')

const user= new Schema({
  
    username:{
        type:String
   },
   nickname:{
       type:String
   },
   email:{
      type:String,
      lowercase:true,
      required:'Email address is required',
      trim:true,
      unique:true,
      validate:(value)=>{
          return validator.isEmail(value)
      }
  },
  password:{
      type:String
  },
  author:{type:String,
    default:''},
  book:{type:String,
    default:''},
  number:{type:String,
    default:''},
  age:{type:String,
    default:''},
  validityStatus:{
      type:String,
      default:'inActive'
  }
},{
    versionKey:false
})


module.exports= mongoose.model('user',user)