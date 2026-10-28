import joi from 'joi';
import { generalRules } from '../../common/utils/generalRules.js';

// ===================================== send Chat Message Schema ========================
export const sendChatMessageSchema = {
body : joi.object({
    conversationId : generalRules.id.required(),
    content : generalRules.content,

}).required(),
files : joi.array().items(generalRules.file)
}

// ===================================== get all Chat Messages Schema ========================
export const getChatMessagesSchema ={
    params : joi.object({
        conversationId : generalRules.id.required()
    }).required()
} 

// ===================================== get specific Chat Message by id Schema ========================
export const getChatMessageByIdSchema ={
    params : joi.object({
        chatMessageId : generalRules.id.required()
    }).required()
} 