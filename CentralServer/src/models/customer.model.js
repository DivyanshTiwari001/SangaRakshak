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

        custMatch:{
            type:Number
        },
        
        objectMatch:{
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