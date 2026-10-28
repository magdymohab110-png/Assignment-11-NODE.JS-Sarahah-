import{hashSync , compareSync} from "bcrypt"
import { SALT_ROUNDS as rounds } from "../../../config/config.service.js";

export const HashSync = async(plainText , SALT_ROUNDS = rounds) =>{
    return hashSync(plainText,SALT_ROUNDS);
}

export const CompareSync = async({plainText ,Encrypt }) =>{
    return compareSync(plainText ,Encrypt)
}