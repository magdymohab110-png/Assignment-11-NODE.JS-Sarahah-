import joi from 'joi';
import { generalRules } from './../../common/utils/generalRules.js';
import { statusEnum } from '../../enum/identityRequest.enum.js';


// ======================================= create identity request schema ==============================

export const createIdentityRequestSchema = {
    body : joi.object({
        messageId : generalRules.id.required()
    })
}

// ======================================= update identity requests schema ==============================

export const updateIdentityRequestSchema = {
    params : joi.object({
        requestId : generalRules.id.required()
    }).required(),
    body : joi.object({
        status : joi.string().valid(statusEnum.accepted , statusEnum.rejected).required()
    }).required()
}

// ======================================= status identity requests schema ==============================
export const statusIdentityRequestSchema = {
    params : joi.object({
        requestId : generalRules.id.required()
    }).required()
}
