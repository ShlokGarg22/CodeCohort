const mongoose = require("mongoose");
require('dotenv').config();
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema(
    {
        email:{type:String , unique:true},
        password:String,
        firstName:String,
        lastName:String
        
    }
)