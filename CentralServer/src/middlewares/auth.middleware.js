import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/ayncHandler.js"
import { User } from "../models/user.model.js"

const verifyJWT = asyncHandler(async(req,_,next)=>{
    const token = req.cookies?.accessToken
    try{
        if(!token){
            throw new ApiError(400,"unauthorized request")
        }

        const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select("-password")

        if(!user){
            throw new ApiError(400,"invalid access token")
        }

        req.user = user
        next()

    }catch(error){
        throw new ApiError(400,error?.message||"invalid access token")
    }
}
)

export {verifyJWT}