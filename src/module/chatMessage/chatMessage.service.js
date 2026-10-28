import { successResponse } from "../../common/utils/success.response.js";
import conversationModel from "../../DB/model/conversation.model.js";
import * as dbService from "../../DB/service/db.service.js";
import chatMessageModel from './../../DB/model/chatMessage.model.js';
import { resChatMessage } from "./chatMessage.helper.js";

//================================== send Chat Message ================================= 

export const sendChatMessage = async(req,res,next) =>{
const {conversationId , content} = req.body;

const conversation = await dbService.findOne({
    model : conversationModel,
    filter : {_id : conversationId,
        $or:[
            {userId1 : req.user._id},
            {userId2 : req.user._id}
        ]
    }
})

if(!conversation){
    throw new Error("conversation id invalid or y are not allowed to join conversation" , 
        {cause : 404});
}
if(!content && !req.files?.length){
    throw new Error("content is required" , {cause : 400});
}

const urls = [];

if(req.files.length){
    for (const file of req.files) {
        urls.push(file.path);
    }
}

const message = await dbService.create({
    model : chatMessageModel,
    data : {
        content,
        conversationId,
        senderId : req.user._id,
        attachments : urls
    }
})

const messageData = await resChatMessage(message);

successResponse({res,statusCode : 201 , message :"the message in this conversation created",
    data : messageData
})

}

//================================== get Chat Messages =================================

export const getChatMessages = async(req,res,next)=>{
    const {conversationId} = req.params;

    const conversation = await dbService.findOne({
        model : conversationModel,
        filter : {
            _id : conversationId,
            $or:[
                {userId1 : req.user._id},
                {userId2 : req.user._id}
            ]
        }
    })

    if(!conversation){
    throw new Error("conversation id is invalid" , {cause : 404});

    }

    const chatMessages = await dbService.find({
        model : chatMessageModel,
        filter : {
            conversationId
        },options :{sort : {createdAt : 1}}
    })

const reschatMessages = await resChatMessage(chatMessages , req.user._id);

    successResponse({res, data : reschatMessages})
}

//================================== get Chat Message by id =================================
// message of chat message that have conversation betwenn two user
export const getChatMessageById = async(req,res,next)=>{
    const {chatMessageId} = req.params;
    
    const chatMessageExist = await dbService.findById({
        model : chatMessageModel,
        id : chatMessageId
    });

    if(!chatMessageExist){
        throw new Error("chat message not found" , {cause : 404});
    }

    const conversationExists = await dbService.findOne({
        model : conversationModel,
        filter : {
            _id : chatMessageExist.conversationId,
            $or : [
                {userId1 : req.user._id},
                {userId2 : req.user._id}
            ]
        }
    })

    if(!conversationExists){
        throw new Error("chat message not found" , {cause : 404});
    }

    successResponse({res , data : await resChatMessage(chatMessageExist , req.user._id)});
}