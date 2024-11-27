import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/ayncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {users} from "../constants.js"

const registerUser = asyncHandler(async(req,res)=>{
    
    const {org_name,username,password} = req.body

    if(!org_name || !username || !password){
        throw new ApiError(400,"each field is mandatory")
    }

    const user = await User.create(
        {
            org_name,
            username,
            password
        }
    )

    const data = await User.findById(user._id).select("-password")

    
    if(!data){
        throw new ApiError(500,"something went wrong")
    }
    
    const accessToken = await data.generateAccessToken()

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .json(new ApiResponse(200,data,"user successfully created"))

})


const loginUser = asyncHandler(async(req,res)=>{
    const {username,password} = req.body;

    if(!username || !password){
        throw new ApiError(400,"creadentials are required")
    }

    const user = await User.findOne({username})

    if(!user){
        throw new ApiError(400,"wrong credentials")
    }

    const isValidPassword = await user.isPasswordCorrect(password)

    if(!isValidPassword){
        throw new ApiError(400,"wrong credentials")
    }

    const loggedInUser = await User.findById(user._id).select("-password")

    const accessToken = await loggedInUser.generateAccessToken()
    
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
           .status(200)
           .cookie("accessToken",accessToken,options)
           .json(
            new ApiResponse(200,loggedInUser,"login successfull")
           )
})

const logoutUser = asyncHandler(async(req,res)=>{
    const user = req.user
    if(!user){
        throw new ApiError(400,"Bad request")
    }
    delete users[`${user._id}`]

    const options = {
        httpOnly:true,
        secure:true
    }

    return res.
            status(200)
            .clearCookie("accessToken",options)
            .json(
                new ApiResponse(200,[],"logout successfull")
            )
})

const getUser = asyncHandler(async(req,res)=>{
    const user = req.user
    if(!user){
        throw new ApiError(400,"Unauthorized access")
    }
    const fetchedUser = await User.findById(user._id).select("-password")

    if(!fetchedUser){
        throw new ApiError(500,"something went wrong")
    }

    return res.status(200)
            .json(new ApiResponse(200,fetchedUser,"successfully fetched user details"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getUser
}