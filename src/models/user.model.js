import mongoose,{Schema} from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const userSchema = new Schema(
    {
        userName:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            trim:true
        },
        password:{
            type:String,
            requires:[true,"Password is reuqired"]
        },
        avatar:{
            type:String,
            required:true
        },
        refreshToke:{
            type:String,
       }
    },
    {
        timestamps:true
    }
)

userSchema.pre(
    "save",async function(next) {
        if(!this.isModified("password")) return next();

        this.password=await bcrypt.hash(this.password,10);
    }
)

userSchema.method.isPasswordCorrect = 
async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this.discriminator,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName
        }
    )
}


export const User = mongoose.model("User",userSchema)