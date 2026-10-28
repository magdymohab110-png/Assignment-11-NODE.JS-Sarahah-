import multer from "multer"
import fs from "fs"
import { randomUUID } from "crypto";
import { UPLOAD_FOLDER } from "../../../config/config.service.js";

export const multerLocal = ({customPath = "General" , customTypes = []})=>{
    const fullPath = `${UPLOAD_FOLDER}/${customPath}`;
    if(!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath , {recursive : true});
    }
    const storage = multer.diskStorage({
        destination : (req,file,cb)=>{
            cb(null , fullPath)
        },
        filename : (req,file,cb)=>{
           cb(null, randomUUID() + "__" + file.originalname) 
        }
    })

    function fileFilter(req,file,cb){
        if(!customTypes.includes(file.mimetype)){
            cb(new Error("invalid file" , {cause : 400}));
        }
        else{
            cb(null , true)
        }
    }
    const upload = multer({storage , fileFilter});
    return upload;
}