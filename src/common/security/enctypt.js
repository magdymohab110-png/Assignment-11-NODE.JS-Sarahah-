import crypto from "crypto";
import { IV_LENGTH as length, ENCRYPTION_KEY as key } from "../../../config/config.service.js";


const ENCRYPTION_KEY = Buffer.from(key);
const IV_LENGTH = length;

export function Encrypt(text){
const iv = crypto.randomBytes(IV_LENGTH);
const cipher = crypto.createCipheriv("aes-256-cbc" , ENCRYPTION_KEY , iv);
let encrypted = cipher.update(text , "utf-8" , "hex");
encrypted += cipher.final("hex");
return iv.toString("hex")+ ":" + encrypted;
}

export function Decrypt(text){
    const [ivHex , encryptedText] = text.split(":");
    const iv = Buffer.from(ivHex , "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc" , ENCRYPTION_KEY , iv);
    let decrypted = decipher.update(encryptedText , "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted

}