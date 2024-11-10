import mongoose,{Schema} from "mongoose";

//   Just testing version after testing sellerId will be attatched
const productSchema = new Schema(
    {
name:{
    type:String,
},
category:{
    type:String
},
// in testing version  one image will be single then there will be arary of images
images:{
    type:String
}
,
price:{
    type:String
}
    },
    {
        timestamps:true
    }
)

export const Product = mongoose.model("Product",productSchema);