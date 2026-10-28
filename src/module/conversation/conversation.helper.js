
 const mapConversation = (conversation)=>({
        id : conversation._id,
        userId1 : conversation.userId1,
        userId2 : conversation.userId2,
        messageId : conversation.messageId, //which who connect between two user
        createdAt : conversation.createdAt
    });


export const resConversation = async(conversation)=>{
 return  Array.isArray(conversation) ? conversation.map(mapConversation) : mapConversation(conversation);
}
