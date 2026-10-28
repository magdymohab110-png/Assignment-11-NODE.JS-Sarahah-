import conversationModel from "../../DB/model/conversation.model.js";
import IdentityRequestModel from "../../DB/model/identityRequest.model.js";
import * as dbService from "../../DB/service/db.service.js";
import { statusEnum } from "../../enum/identityRequest.enum.js";
import messageModel from './../../DB/model/message.model.js';
import { successResponse } from './../../common/utils/success.response.js';

// ===================================== create identity requests ================================
export const createIdentityRequest  = async(req,res,next) =>{
    const {messageId} = req.body;

    const messageExist = await dbService.findById({
        model : messageModel,
        id : messageId
    })

    if(!messageExist){
        throw new Error("message not found" , {cause : 404});    
    }

    if(messageExist.userId.toString() !== req.user._id.toString()){
        throw new Error("you are not allowed to request this message" , {cause : 400});    
    }

    const identityRequestExist = await dbService.findOne({
        model : IdentityRequestModel,
        filter : {messageId}
    })

    if(identityRequestExist?.status === statusEnum.pending){
        throw new Error("the user didnot answer yet" , {cause : 400});    
    }

        if(identityRequestExist?.status === statusEnum.accepted){
        throw new Error("the user already accepted" , {cause : 400});    
    }

        if(identityRequestExist?.status === statusEnum.rejected){
        throw new Error("the user rejected y cant send anymore" , {cause : 400});    
    }

    const identityRequest = await dbService.create({
        model : IdentityRequestModel,
        data :{
            messageId,
            requesterId : req.user._id,
            senderId : messageExist.senderId
        }
    })


    const createIdentityRequest = identityRequest.length == 0 ? identityRequest : identityRequest[0];
    // i did that becasue i dont want in response all data we cant do select from
    // create so we like customize form of response

    const resIdentityRequest = {
        id : createIdentityRequest._id,
        messageId : createIdentityRequest.messageId,
        requesterId : createIdentityRequest.requesterId,
        status : createIdentityRequest.status,
        createdAt : createIdentityRequest.createdAt
    }
    successResponse({res, statusCode : 201 , message : "identity request created successfully", data : resIdentityRequest})
    
}

// ===================================== get pend identity requests  ================================

export const pendIdentityRequest = async(req,res,next) =>{

    const identityRequestList = await dbService.find({
        model : IdentityRequestModel,
        filter : {
            senderId : req.user._id,
            status : statusEnum.pending
        }
    })

    if(!identityRequestList.length){
    successResponse({res , message : "you have no identity request" , data : identityRequestList});
    }

    successResponse({res , data : identityRequestList });

}

// ===================================== update identity requests  ================================

export const updateIdentityRequest = async(req,res,next)=>{
    const {requestId} = req.params;
    const {status} = req.body;

    const identityRequest = await dbService.findOneAndUpdate({
        model : IdentityRequestModel,
        filter : {
            _id : requestId,
            status : statusEnum.pending,
            senderId : req.user._id
        },update : {status}
    })

   if(!identityRequest){
    throw new Error("invalid request id or y are not allowed to answer this request" , {cause : 400});
   }
   if(status == statusEnum.accepted){
   
    const [userId1, userId2] = [
            identityRequest.requesterId.toString(),
            identityRequest.senderId.toString()
        ].sort(); // we did like sort so the user1 will be always the same in every conversation with user2

    const conversation = await dbService.findOne({
        model : conversationModel,
        filter : {userId1 , userId2}
    })
    if(!conversation){
            await dbService.create({
            model : conversationModel,
            data : {
                userId1,
                userId2,
                messageId : identityRequest.messageId
            }
        })

    }
   }

    successResponse({res,message : `identity request ${status} successfully`});

}

// ===================================== status identity requests  ================================

export const statusIdentityRequest = async(req,res,next)=>{
   
    const identityRequest = await dbService.findOne({
        model : IdentityRequestModel,
        filter:{
            _id : req.params.requestId,
            requesterId : req.user._id
        }
    })

    if(!identityRequest){
    throw new Error("invalid request id or y are not allowed to see this request" , {cause : 400});
    }

    if(identityRequest?.status == statusEnum.accepted){      
        successResponse({res , message : `the user ${statusEnum.accepted} his id : ${identityRequest.senderId}`})
    }

    if(identityRequest?.status == statusEnum.rejected){
        successResponse({res , message : `the user ${statusEnum.rejected} the request`});
    }

    if(identityRequest?.status == statusEnum.rejected){
        successResponse({res , message : `the user did not answer yet`});
    }

}