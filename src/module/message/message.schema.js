import joi from 'joi';
import { generalRules } from './../../common/utils/generalRules.js';

// ======================================= create message schema ==============================
export const createMessageSchema = {
    body : joi.object({
        content : generalRules.content,
        userId : generalRules.id.required()
    }),

    files : joi.array().items(generalRules.file).max(3)
}


// ======================================= get message by id schema ==============================

export const getMessageByIdSchema = {
    params :joi.object({  
        id : generalRules.id.required()
    }).required()
}

// ======================================= delete message by id schema ==============================

export const deleteMessageByIdSchema = {
    params :joi.object({  
        id : generalRules.id.required()
    }).required()
}

