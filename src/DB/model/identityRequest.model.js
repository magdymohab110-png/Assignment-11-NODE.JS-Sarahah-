import mongoose from "mongoose";
import { statusEnum } from "../../enum/identityRequest.enum.js";

const IdentityRequestSchema = new mongoose.Schema({
    messageId : {
        type : mongoose.Types.ObjectId,
        ref : "Message",
        required : true,
        unique : true
    },
    senderId :{
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
    requesterId : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
       status : {
        type : String,
        enum : Object.keys(statusEnum),
        default : statusEnum.pending
    }
},{
    strict : true,
    strictQuery : true,
    timestamps : true
})

const IdentityRequestModel = mongoose.models.IdentityRequest || mongoose.model("IdentityRequest",IdentityRequestSchema )

export default IdentityRequestModel