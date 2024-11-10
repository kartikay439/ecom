import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"

import {uploadOnCLoudinary} from '../utils/cloudinary.service.js'


import mongoose from "mongoose";
import { Product } from "../models/product.model.js";


const addProduct = asyncHandler(
    async(req,res)=>{
        const {name,category,price} = req.body;

        console.log(name)

        // if any one field is empty string then it wil, return true
        if([name,category,price].some(v=>v?.trim==="")){
throw new ApiError(400,"All fileds reuqired");
        }

        //handling image from then  body   we are using .files with thwen help of multer
        const imagesLocalPath = req.files?.images[0]?.path;

        console.log(imagesLocalPath);

        // image will be accessed from local path and will uplod on cloud
        const images = await uploadOnCLoudinary(imagesLocalPath);

        console.log(images.url);

        const product = await Product.create(
            {
                name,
                category,
                price,
                images:images.url
            }
        ) 
        if(!product){
            throw new ApiError(400,"new product not added")
        }
        const newProduct = await Product.findById(product._id);

        return res.status(201).json(
            new ApiResponse(200,newProduct,"Product added Successfully")
        )
    }
)

const getAllProducts = asyncHandler(
    async (req,res) => {
        const allProduct  =await Product.find({})
        if(!allProduct){
            throw new ApiError(400,"Network or Code Error");
        }

        console.log("All products are requested");
       return res.json(allProduct);
    }
)
  export {addProduct,getAllProducts}

