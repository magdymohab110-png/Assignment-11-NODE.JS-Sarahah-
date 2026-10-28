import { Router } from "express";
import { authentication } from "../../common/middleware/authentication.js";
import { multerLocal } from './../../common/middleware/multer.js';
import { multerEnum } from './../../enum/multer.enum.js';
import * as CM from "./chatMessage.service.js";
import Validation from "../../common/middleware/validation.js";
import * as CMV from "./chatMessage.schema.js";

const chatMessageRouter = Router({caseSensitive : true , strict : true});

// send Chat Message 
chatMessageRouter.post("/send" , 
    multerLocal({ customPath : "chat" , customTypes : multerEnum.images})
    .array("attachments" , 3)
    , authentication , Validation(CMV.sendChatMessageSchema) , CM.sendChatMessage);

// get all chat messages
chatMessageRouter.get("/all/:conversationId" , authentication , Validation(CMV.getChatMessagesSchema), CM.getChatMessages);

// get specific chat message by id
chatMessageRouter.get("/:chatMessageId" , authentication , Validation(CMV.getChatMessageByIdSchema) , CM.getChatMessageById)

export default chatMessageRouter;