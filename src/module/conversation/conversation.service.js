import conversationModel from "../../DB/model/conversation.model.js";
import * as dbService from "../../DB/service/db.service.js";
import { successResponse } from './../../common/utils/success.response.js';
import { resConversation } from './conversation.helper.js';


// ===================================== get all conversations ===========================
export const getConversations = async(req,res,next) =>{

    const conversationExist = await dbService.find({
        model : conversationModel,
        filter : {
            $or:[
                {userId1 : req.user._id},
                {userId2 : req.user._id}
            ]
        },
        options:{sort : {createdAt : 1}}
    })

      if(!conversationExist.length){
        successResponse({res , message : "y don't have any conversation"});
    }

const conversation = await resConversation(conversationExist);
  
        successResponse({res , data : conversation});
}

// ===================================== get conversation by id ===========================

export const getConversationById = async(req,res,next) =>{
    const {conversationId} = req.params

    const conversationExist = await dbService.findOne({
        model : conversationModel,
        filter : {
           _id: conversationId,
            $or:[
                {userId1 : req.user._id},
                {userId2 : req.user._id}
            ]
        }
    })
if(!conversationExist){
        throw new Error("invalid conversation id" , {cause : 404});
    }
const conversation = await resConversation(conversationExist);

        successResponse({res , data : conversation});
}