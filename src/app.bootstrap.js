import { ALLOWORIGINS, PORT } from "../config/config.service.js";
import express from "express";
import connectDB  from "./DB/connectionDB.js";
import userRouter from "./module/user/user.controller.js";
import cors from "cors"
import { connectRedis } from "./DB/redis.connection.js";
import messageRouter from "./module/message/message.controller.js";
import identityRequestRouter from "./module/identityRequest/identityRequest.controller.js";
import conversationRouter from "./module/conversation/conversation.controller.js";
import chatMessageRouter from "./module/chatMessage/chatMessage.controller.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
const app = express();

const limiter = rateLimit({
    windowMs : 60*1000,
    limit : 30,
    standardHeaders : true,
    legacyHeaders : false,
    handler : (req,res)=>{
        res.status(429).json({
            message : "stop that !!! Too many requests"
        })
    }
})



const bootstrap = async()=>{

    app.use(cors({
        origin : function(origin , cb){
            if([...ALLOWORIGINS , undefined].includes(origin)){
                cb(null , true)
            }
            else{
                cb(new Error("not allowed origin"));
            }
        }
    }));

    app.use(helmet());
    app.use(limiter);
    app.use(express.json());
    
    app.get("/" , (req,res,next)=>{
    return res.status(200).json({message : "hello in our sarahah app .... 👍"});
})

await connectDB();
await connectRedis();

app.use("/users" , userRouter);
app.use("/messages" , messageRouter);
app.use("/identity-requests" , identityRequestRouter);
app.use("/conversations" , conversationRouter);
app.use("/chat-messages" , chatMessageRouter )


app.all("{/*demo}" , (req,res,next)=>{
    throw new Error(`the URL : ${req.originalUrl} with method ${req.method} not found`,
        {cause : 404}
    )
})



app.use((err , req , res , next)=>{
res.status(err.cause || 500).json({message : err.message , stack : err.stack,
    statusCode : err.cause || 500 , errors : err.errors || []
});
})

app.listen(PORT , ()=>{
    console.log(`server is running in port ${PORT}`);
})


}

export default bootstrap;