
import userModel from "../../DB/model/user.model.js";
import * as dbService from "../../DB/service/db.service.js";
import messageModel from './../../DB/model/message.model.js';
import { successResponse } from './../../common/utils/success.response.js';



// ===================================== create message ================================
export const createMessage = async(req , res , next) =>{
    const {content , userId} = req.body;

    if(!content && !req.files?.length){
        throw new Error("content is required" , {cause : 400});
    }


   const userExist = await dbService.findById({
    model : userModel,
    id : userId
   });


   if(!userExist){
        throw new Error("user not found" , {cause : 404});
   }

   const urls = [];
   if(req?.files?.length){
    for (const file of req?.files) {
        urls.push(file.path);
    }
   }
   
   if(userId.toString() === req.user._id.toString()){
        throw new Error("you can't send message to yourself" , {cause : 400});
   } // senderId === userId

   const message = await dbService.create({
    model : messageModel,
    data : {
        content ,
        userId,
        attachments : urls,
        senderId : req.user._id
    }
   })



   const createdMessage = message.length == 0 ? message : message[0];
   // i did that becasue i dont want in response all data we cant do select from
    // create so we like customize form of response

const responseData = {
  id: createdMessage._id,
  content: createdMessage.content,
  attachments: createdMessage.attachments,
  createdAt: createdMessage.createdAt
};

   successResponse({res , statusCode : 201 , message :"message created successfully", data : responseData});
}

// ===================================== get all messages ================================

export const getAllMessage = async(req , res , next) =>{
    const messages = await dbService.find({
        model : messageModel,
        filter : {userId : req.user._id},
        options : {populate : {path : "userId" , select: "email fName lName -_id"}}
    })

    if(!messages.length){
successResponse({res , message : "you have no messages",data: messages});

    }
    successResponse({res,data:messages});

}

// ===================================== get message by id ================================

export const getMessageById = async(req ,res , next)=>{
    const {id} = req.params;

    const message = await dbService.findOne({
        model : messageModel,
        filter :{
            userId : req.user._id,
            _id : id
        }
    })

       if(!message){
        throw new Error("message not found" , {cause : 404});
    }
    successResponse({res,data:message});
}

// ===================================== delete message by id ================================

export const deleteMessageById = async(req,res,next)=>{
       const message = await dbService.findOneAndDelete({
        model : messageModel,
        filter :{
            _id : req.params.id,
            userId : req.user._id
            
        }
    })

    if(!message){
        throw new Error("message not found or y cant delete this message" , {cause : 404});
    }

    successResponse({res, message :"message deleted successfully" , data : message});

}
// ===================================== delete all messages ================================

export const deleteAllMessages = async(req,res,next)=>{
    const messages = await dbService.deleteMany({
        model : messageModel,
        filter: {userId : req.user._id}
    });

    if(!messages.deletedCount){
        throw new Error("messages not found " , {cause : 404});
    }

    successResponse({res, message :"all messages deleted successfully"});
}

