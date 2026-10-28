import joi from "joi"
import { genderEnum } from "../../enum/user.enum.js"
import { Types } from "mongoose"
export const generalRules ={

    content : joi.string(),
    id : joi.string().hex().custom((v,h)=>{
        return Types.ObjectId.isValid(v) ? v : h.message("invaild id") 
    }),
    email : joi.string().email(),
    password : joi.string(),

    fName : joi.string().alphanum().min(2).max(10).trim(),
        lName : joi.string().alphanum().min(2).max(10).trim(),
        gender : joi.string().valid(...Object.keys(genderEnum)),
        age : joi.number().min(20).max(60),
        phone : joi.string(),

    file : joi.object({
        fieldname : joi.string().required(),
        originalname : joi.string().required(),
        encoding : joi.string().required(),
        mimetype : joi.string().required(),
        path : joi.string(),
        destination : joi.string(),
        filename : joi.string(),
        size : joi.number().required()
    }),
    
    token : joi.object({
        authorization : joi.string().required(),
        "postman-token" : joi.string(),
        "content-length" : joi.string(),
        host : joi.string(),
        "user-agent" : joi.string(),
        accept : joi.string(),
        "accept-encoding" : joi.string(),
        connection : joi.string()
    }),
    otp : joi.string().pattern(/^[0-9]{6}$/)
}