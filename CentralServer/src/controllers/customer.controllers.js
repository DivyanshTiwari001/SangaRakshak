import { users } from "../constants.js";
import { Customer } from "../models/customer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";
import globalSocket from "../index.js";



const customerEntryController = asyncHandler(async(req,res)=>{
    const {orgId} = req.body
    if(!orgId || !isValidObjectId(orgId)){
        throw new ApiError(400,"required organization details")
    }

    const custPhotoLocalPath = req.files?.customerPhoto[0]?.path 
    const objectPhotoLocalPath = req.files?.objectPhoto[0].path

    if(!custPhotoLocalPath){
        throw new ApiError(400,"customer image required")
    }

    const entryCustPhoto = await uploadOnCloudinary(custPhotoLocalPath)
    const entryObjectPhoto = await uploadOnCloudinary(objectPhotoLocalPath)

    if(!entryCustPhoto){
        throw new ApiError(500,"something went wrong")
    }

    const customer = await Customer.create(
        {
            orgId,
            entryCustPhoto:entryCustPhoto.url,
            entryObjectPhoto:entryObjectPhoto?.url || ""
        }
    )

    if(!customer){
        throw new ApiError(500,"something went wrong")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,{customerId:customer._id},"entry created successfully"))
})

const customerExitController = asyncHandler(async(req,res)=>{
    const {customerId,custMatch,objectMatch} = req.body

    if(!customerId || !custMatch || !objectMatch || !isValidObjectId(customerId)){
        throw new ApiError(400,"customer details required")
    }

    const exitCustPhotoLocalPath = req.files?.customerPhoto?.[0].path
    const exitObjectPhotoLocalPath = req.files?.objectPhoto?.[0].path

    if(!exitCustPhotoLocalPath){
        throw new ApiError(400,"customer image required")
    }

    const exitCustPhoto = await uploadOnCloudinary(exitCustPhotoLocalPath)
    const exitObjectPhoto = await uploadOnCloudinary(exitObjectPhotoLocalPath)

    const customer = await Customer.findById(customerId)
    
    customer.exitCustPhoto = exitCustPhoto.url
    customer.exitObjectPhoto = exitObjectPhoto?.url || ""
    customer.custMatch = custMatch
    customer.objectMatch = objectMatch

    if(customer.custMatch < 60 || customer.objectMatch < 60){
        customer.suspicious = true
        await customer.save()
        globalSocket.to(users[customer.orgId]).emit("suspicious",new ApiResponse(200,customer,"suspicion detected"))
        return res
               .status(200)
               .json(new ApiResponse(100,[],"wait until request is being processed"))
    }
    await customer.save()
    return res
           .status(200)
           .json(new ApiResponse(200,[],"successfully exited"))
})


const getCustomerInfo = asyncHandler(async(req,res)=>{
        const {customerId} = req.body
        
        if(!customerId || !isValidObjectId(customerId)){
            throw new ApiError(400,"customer details are required")
        }

        const customer = await Customer.findById(customerId)

        if(!customer){
            throw new ApiError(500,"something went wrong")
        }

        return res
            .status(200)
            .json(new ApiResponse(200,customer,"successfully fetched customer"))
})

const submitReason = asyncHandler(async(req,res)=>{
    
    const {customerId} = req.body

    if(!customerId){
        throw new ApiError(400,"customer details are required")
    }

    const audioReasonLocalPath = req.file?.path

    if(!audioReasonLocalPath){
        throw new ApiError(400,"reason required")
    }

    const audioReason = await uploadOnCloudinary(audioReasonLocalPath)

    if(!audioReason){
        throw new ApiError(500,"something went wrong")
    }

    const customer = await Customer.findByIdAndUpdate(customerId,
        {
            $set:{
                reason:audioReason.url
            }
        },
        {
            new:true
        }
    )

    globalSocket.to(users[customer.orgId]).emit("reason",new ApiResponse(200,customer,"reason fetched successfully"))

    return res
        .status(200)
        .json(new ApiResponse(100,[],"wait until your request is being processed"))
})


export {
    customerEntryController,
    customerExitController,
    getCustomerInfo,
    submitReason
}