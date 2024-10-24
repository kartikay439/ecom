import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_SECRETKEY
});

const uploadOnCLoudinary = async (localfilePath) => {
    try {
        if (!localfilePath) {
            return null;
        }
        // upload file
        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: "auto"
        });
        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.secure_url);
        // optional: remove the locally saved temporary file
        fs.unlinkSync(localfilePath); 
        return response;
    } catch (error) {
        console.error("Error uploading file:", error);
        // remove the locally saved temporary file as the upload operation failed
        fs.unlinkSync(localfilePath); 
        throw error;
    }
};

export { uploadOnCLoudinary };
