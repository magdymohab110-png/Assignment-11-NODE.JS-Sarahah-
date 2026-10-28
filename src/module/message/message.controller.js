import { Router } from "express";
import * as MS from './message.service.js';
import { authentication } from './../../common/middleware/authentication.js';
import { multerLocal } from './../../common/middleware/multer.js';
import { multerEnum } from './../../enum/multer.enum.js';
import * as MV from "./message.schema.js";
import  optionalAuthentication  from "../../common/middleware/optionalAuthentication.js";
import Validation from "../../common/middleware/validation.js";


const messageRouter = Router({strict : true , caseSensitive : true});

// create message
messageRouter.post("/create",
    multerLocal({customPath :"message" , customTypes : multerEnum.images})
    .array("attachments" , 3),
     authentication, Validation(MV.createMessageSchema) , MS.createMessage);

// get all messages
messageRouter.get("/all", authentication , MS.getAllMessage);

// get specific message
messageRouter.get("/:id" , authentication,Validation(MV.getMessageByIdSchema) , MS.getMessageById)

// delete all messages
messageRouter.delete("/all" , authentication , MS.deleteAllMessages)

// delete specific message
messageRouter.delete("/:id" , authentication,Validation(MV.deleteMessageByIdSchema) , MS.deleteMessageById)


export default messageRouter