const mapChatMessage = (chatMessage , userId)=>{
    const data = {
 id : chatMessage._id,
    content : chatMessage.content,
    conversationId : chatMessage.conversationId,
    senderId : chatMessage.senderId,
    attachments : chatMessage.attachments,
    createdAt : chatMessage.createdAt
    }
      
    if(userId){
        data.isMine = chatMessage.senderId.toString() === userId.toString();
    }
    return data;
};

export const resChatMessage = async(chatMessage , userId)=>{
    return Array.isArray(chatMessage) ? chatMessage.map(msg => mapChatMessage(msg,userId)) 
    : mapChatMessage(chatMessage , userId)
}