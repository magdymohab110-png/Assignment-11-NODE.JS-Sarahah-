import mongoose from "mongoose"

const chatMessageSchema = mongoose.Schema({
    conversationId : {
        type : mongoose.Types.ObjectId,
        ref : "Conversation",
        required : true
    },
    senderId :{
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },// becasue every message need to have sender
    content : {
        type : String,
        required : function(){
            return this.attachments.length > 0 ? false : true
        },
        trim : true
    },
    attachments : [String]
},{
    strict : true,
    strictQuery : true,
    timestamps : true
})

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
// to make the 
const chatMessageModel = mongoose.models.ChatMessage || mongoose.model("ChatMessage" , chatMessageSchema);

export default chatMessageModel
