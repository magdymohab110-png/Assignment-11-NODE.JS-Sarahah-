import mongoose from "mongoose"

const conversationSchema = mongoose.Schema({
    userId1:{
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
    userId2:{
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
    messageId :{
        type : mongoose.Types.ObjectId,
        ref : "Message",
        required : true,
        unique : true
    } // we did it becase the messageId who will start the conversation 
},{
     strict : true,
    strictQuery : true,
    timestamps : true
})

conversationSchema.index({userId1 : 1 , userId2 : 1} , {unique : true});
// to make it faster

const conversationModel = mongoose.models.Conversation || mongoose.model("Conversation" , conversationSchema);
conversationModel.syncIndexes();

export default conversationModel;

