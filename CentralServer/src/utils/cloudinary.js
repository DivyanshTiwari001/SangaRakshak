import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


const uploadOnCloudinary = async(localFilePath)=>{
    try{
        if(!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type:"auto"
            }
        );

        fs.unlinkSync(localFilePath);

        return response;
    }catch(error){
        fs.unlinkSync(localFilePath)
        return null
    }
}

const removeFromCloudinary = async (fileUrl)=>{
    try{
        const publicId = fileUrl.substring(fileUrl.lastIndexOf('/')+1,fileUrl.lastIndexOf('.'));
        const response = await cloudinary.uploader.destroy(publicId);
        return response
    }catch(err){
        return null
    }
}

export {
    uploadOnCloudinary,
    removeFromCloudinary
}