import mongoose from "mongoose";
console.log("user.model.js: Defining User Mongoose Schema.");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["instructor","student"],
        default:'student'
    },
    enrolledCourses:[
        {
            type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
        }
    ],
    photoUrl:{
        type:String,
        default:""
    }

},{timestamps:true});

export const User = mongoose.model("User", userSchema);

console.log("user.model.js: User Model 'User' created from schema and exported.");