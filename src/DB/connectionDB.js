import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

 async function connectDB(){
    try{
        await mongoose.connect(DB_URI , {serverSelectionTimeoutMS : 5000});
        console.log("DB is connected successfully");

    }catch{
        console.log("DB is failed to connect");

    }
}

export default connectDB;