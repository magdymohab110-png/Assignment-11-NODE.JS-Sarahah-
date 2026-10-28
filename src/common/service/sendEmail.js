import nodemailer from "nodemailer";
import { randomInt } from 'node:crypto';
import { EMAIL, PASSWORD } from "../../../config/config.service.js";

export const sendEmail = async({to , subject , html , attachments})=>{

const transporter = nodemailer.createTransport({ 
service : "gmail",
auth : {
    user : EMAIL,
    pass : PASSWORD
}
})

  const info = await transporter.sendMail({
    from: `"sarahah app" <${EMAIL}>`,
    to,
    subject,
    html: html || "<h1>Hello world?</h1>",
    attachments : attachments || []
  });


  return info.accepted.length > 0 ? true : false;
}

export const generate_otp = async()=>{
return randomInt( 100000 , 1000000).toString();
}
