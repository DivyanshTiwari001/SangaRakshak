import mongoose from "mongoose";


const customerSchema = new mongoose.Schema(
    {
        orgId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },

        entryCustPhoto:{
            type:String,
            required:true
        },

        exitCustPhoto:{
            type:String
        },

        entryObjectPhoto:{
            type:String,
        },

        exitObjectPhoto:{
            type:String
        },

        entryXrayPhoto:{
            type:String
        },

        exitXrayPhoto:{
            type:String
        },

        entryWeight:{
            type:Number,
        },

        exitWeight:{
            type:Number
        },

        custMatch:{
            type:Number
        },
        
        objectMatch:{
            type:Number
        },

        xrayMatch:{
            type:Number
        },

        suspicious:{
            type:Boolean,
            default:false
        },

        reason:{
            type:String,
        }
    },
    {
        timestamps:true
    }
)


export const Customer = mongoose.model("Customer",customerSchema);