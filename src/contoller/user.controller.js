import asyncHandler from "../utils/asyncHandler.js"
import ApiError from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCLoudinary} from '../utils/cloudinary.service.js'
import ApiResponse from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"


const generateAccessAndRefreshTokens = async (UserId) => {
    try {
        const user = await User.findById(UserId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
};


const registerUser = asyncHandler(async (req,res)=>{
//get user detail from frontend
//validation -notnull
//check if user already exist or not
//check for images or avatar
//upload them on cludinary

// create user object and make entry in db
//remove password and refeersh token field from  response
//check for user creation
//return res
const{
email,userName,password
} = req.body 
console.log("email: ",email)

// if(fullname===""){
//     throw new ApiError(400,"Full name is required")
// }

if(
    [email,userName,password].some((f)=>f?.trim()===""
    ))
    {
        throw new ApiError(400,"All fields are required")
    }

const existedUser=await User.findOne({
    $or:[{userName},{email}]
})

if(existedUser){
    throw new ApiError(409,"User with duplicate username or email ! ")
}


const avatarLocalPath = req.files?.avatar[0]?.path;
// let coverImageLocalpath;
// if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
//     coverImageLocalpath=req.files.coverImage[0].path

// }
console.log(avatarLocalPath)

if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is required")
}

const avatar = await uploadOnCLoudinary(avatarLocalPath)

if (!avatar) {
    throw new ApiError(400,"Avatar is required")
}
console.log(avatar.url)

const user = await User.create({
    avatar:avatar.url,
    email,
    password,
    userName:userName.toLowerCase()
})

const createdUser =await User.findById(user._id).select(
    "-password -refreshToken"
)

if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
)



})





 const loginUser = asyncHandler (
    async (req,res) =>{
        // req body -> data
        //username or email
        //find the user
        //password check    
        //access and refresh token
        //send cookie


        const{email,username,password}=req.body
        console.log(req.body)
        console.log(username)

        if(!username && !email){
            throw new ApiError(400,"Username or Password is reqired")
        }
        const user = await User.findOne({
            $or:[{email},{username}]
        })

        if (!user) {
            throw new ApiError(400,"user not registered")
        }
        
        const isPasswordValid = await user.isPasswordCorrect(password)
        if (!user) {
            throw new ApiError(400,"Invalid user credentials")
        }
        const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

        //Costly OPERATION WARNING
        //WARNING
        //WARNING

        const loggedUser = await User.findById(user._id).select("-password -refreshToken")


        //GENERATING Cookies
        const option  = {
            httpOnly:true,
            secure:true
        }
      

        return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option).json(new ApiResponse(200,{
            user:loggedUser,accessToken,refreshToken
        },"user logged in successfully"))




    }
 )


 const logOutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAcessToken = asyncHandler(
    async (req,res)=>{
       try {
         const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
 
         if(!incomingRefreshToken){
             throw new ApiError(401,"Unauthorized Acccess");        
         }
 
         const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
         const user =await User.findById(decodedToken._id);
         if(!user){
             throw new ApiError(400,"Invalid refresh token")
         }
         console.log("User",user)
 console.log("incoming token",incomingRefreshToken);
 console.log("db",user.refreshToken);

         if (incomingRefreshToken!==user?.refreshToken) {
             throw new ApiError(401,"Refresh token is expired or used");
         }
         const option = {
             httpOnly: true,
             secure: true
         }
     
 
       const  {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

 
       return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option).json(new ApiResponse(200,{
         user,accessToken,refreshToken
     },"Access token refreshed"))
 
       } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token");
       }

     

    }
)

const changeCurrentPassword = asyncHandler(
    async (req,res)=>{
        const {oldPassword,newPassword} = req.body

        const user = await User.findById(req.user?._id);
        const isPasswordCorrect =await user.isPasswordCorrect(oldPassword)

        if (!isPasswordCorrect) {
            new ApiError(404,"Old password not matched")
        }
user.password=newPassword;
await user.save({validateBeforeSave:false});

return res.status(200).json(
    ApiResponse(200,{},"Password changed successfully")
)

    }
);

const getCurrentUser = asyncHandler(
    async (req,res)=>{
        const user = req.user;
        if (!user) {
            throw new ApiError(401,"Please signIn First");
        }
        return res.status(200).json(
            new ApiResponse(200,user,"You are logged In")
        )
    }
)

const updateAccountDeteails  = asyncHandler(
    async (req,res)=>{
const {fullname,email} = req.body

if(!fullname || !email){
    throw new ApiError(400,"All fields are required");
}
    const user = User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullname,email
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Account detail updated successfully")
    )


    }
)

const avatarUpdate = asyncHandler(
    async(req,res)=>{
        const user = req.user;
        if (!user) {
            throw new ApiError(400,"You are Required to login first")
        }

        avatarLocalPath = req.files?.path;

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is missing");
        }

        const avatar = await uploadOnCLoudinary(avatarLocalPath);

        if(!avatar.url){
            throw new ApiError(400,"Unable to upload on cloud");
        }

        // const user_db = User.findById(user._id);
        // user_db.avatar = avatar.url;
        // user_db.save()
        await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    avatar:avatar.url
                }
            },
                {
                    new:true
                }
            
        ).select("-passeord");
        return res.status(200).json(
            new ApiResponse(200,{},"File Updates : Avatar")
        )
    }
)


///  MAKE AT YOUR OWN CONTROLLER TO UPDATE COVER IMAGE FILE









export {registerUser,loginUser,logOutUser,refreshAcessToken,changeCurrentPassword,getCurrentUser,updateAccountDeteails,avatarUpdate}