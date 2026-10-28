import { Router } from "express";
import { authentication } from './../../common/middleware/authentication.js';
import * as CO from "./conversation.service.js";

const conversationRouter = Router({caseSensitive : true , strict : true});

// get all conversations
conversationRouter.get("/all" , authentication , CO.getConversations);

// get conversation by id
conversationRouter.get("/:conversationId" , authentication , CO.getConversationById)


export default conversationRouter;