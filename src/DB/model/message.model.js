import mongoose from "mongoose";



const messageSchema = new mongoose.Schema({
    content : {
        type : String,
        required : function(){
            return this.attachments?.length ? false : true;
        },
        trim : true
    },
    attachments : [String],
    userId : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
    senderId : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    }

}, {
    strict : true,
    strictQuery : true,
    toJSON : {virtuals : true},
    toObject : {virtuals : true},
    timestamps : true
})

const messageModel = mongoose.models.Message || mongoose.model("Message" , messageSchema);

export default messageModel;