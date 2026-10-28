
import { CompareSync, HashSync } from "../../common/security/hash.js";
import * as dbServices from "../../DB/service/db.service.js";
import userModel from "../../DB/model/user.model.js";
import { providerEnum } from "../../enum/user.enum.js";
import { Decrypt, Encrypt } from './../../common/security/enctypt.js';
import jwt from "jsonwebtoken";
import {OAuth2Client} from 'google-auth-library';

import { randomUUID } from 'crypto';
import * as dbRedis from './../../DB/service/redis.service.js';
import { generate_otp, sendEmail } from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utils/events.js";
import { sendEmailOtp } from "./user.helper.js";
import * as env  from "../../../config/config.service.js";
import { successResponse } from './../../common/utils/success.response.js';
import emailTemplate from "../../common/utils/otp-email-template.js";
const client = new OAuth2Client();

//====================================== sign up user ===========================


export const signUp = async (req , res , next) =>{
    const {fName,lName ,email,password,age,gender,phone,role} = req.body;

    const paths = [];
    // console.log(req.files);
    
    for (const file of req.files.attachments) {
        paths.push(file.path);
        
    }

    if(await dbServices.findOne({
        model : userModel,
        filter : {email : email.toLowerCase()}
    }))
    {
        throw new Error("email already exist" , {cause : 409});
    }

    const otp = await generate_otp();
    const otpHash = await HashSync(otp , env.SALT_ROUNDS);

    await dbRedis.setValue({
        key : `otp::${email}`,
        value : otpHash,
        ttl : env.OTP_EMAIL
    })

   eventEmitter.emit("confirm_email" , async()=>{
     await sendEmail({
        to : email,
        subject : "confirm email from sarahah app",
        html : await emailTemplate({
            appName : "Sarahah app",
            expiryMinutes : (env.OTP_EMAIL / 60),
            otp
        })
    })
   })

    const user = await dbServices.create({
        model : userModel,
        data :{
            fName,
            lName,
            gender,
            age,
            email,
            password :await HashSync(password , env.SALT_ROUNDS),
            provider : providerEnum.system,
            phone : Encrypt(phone),
            gender,
            role,
            profileImage : req.files.attachment[0].path,
            coverOfImages : paths
        }
    });

    const createdUser = Array.isArray(user) ? user[0] : user;

    const checkPassword = !await CompareSync({plainText : "12345121" , Encrypt: createdUser.password}) ? true : false

    successResponse({res, statusCode : 201 , message :"user created successfully" ,data : {user , checkPassword}});
}

//====================================== sign in user ===========================


export const signIn = async(req,res,next)=>{

    const {email , password} = req.body;
    const emailLowerCase = email.toLowerCase()

    const isBlocked_signin = await dbRedis.ttl(`signIn::block::${emailLowerCase}`);
    
    if(isBlocked_signin > 0){
        throw new Error(`y are blocked from system y can try again after ${isBlocked_signin} seconds`,{cause : 429})
    }

    const maxCount = await dbRedis.getValue(`signIn::${emailLowerCase}`);
    
    if(maxCount >= 5){
        await dbRedis.setValue({
            key : `signIn::block::${emailLowerCase}`,
            value : "1",
            ttl : env.OTP_BLOCK_SIGNIN
        })
        await dbRedis.deleteKey(`signIn::${emailLowerCase}`);

        throw new Error(`y exceeded the number of reqests`,{cause : 429})
        
    }

    const user = await dbServices.findOne({
        model : userModel,
        filter : {email : emailLowerCase,
            provider : providerEnum.system,
            isConfirmed : {$exists : true}
        }
    })
    if(!user){
        throw new Error("email not exist or not confirmed" , {cause : 404});
        
    }

    if(!await CompareSync({plainText : password , Encrypt : user.password})){
        await dbRedis.incr(`signIn::${emailLowerCase}`);
        throw new Error("password invalid" , {cause : 400});
    }
    console.log(user.email, user._id);

    const tokenId = randomUUID();

    const access_token = jwt.sign({ id : user._id} ,env.ACCESS_TOKEN_SIGNTURE , {
        expiresIn : env.ACCESS_TOKEN_EXP,
        jwtid : tokenId
    });

    const refresh_token = jwt.sign({id : user._id } ,env.REFRESH_TOKEN_SIGNTURE,{
        expiresIn : env.REFRESH_TOKEN_EXP,
        jwtid : tokenId
    });

    await dbRedis.deleteKey(`signIn::${emailLowerCase}`);

    successResponse({res, message : "done" , data : {user , access_token , refresh_token}});

}

// ====================================== get profile user ===========================


export const getProfile = async (req,res,next) =>{

    const user = req.user;

    successResponse({res, message : "user profile found successfully" , data : user });

}

//====================================== sign up with google gmail ===========================


export const signUpWithGmail = async(req,res,next) =>{
    const {idToken} = req.body;

  const verifyToken = await client.verifyIdToken({
      idToken,
      audience: env.AUDIENCE_GMAIL
  });
  const payload = verifyToken.getPayload();



    const {email ,email_verified ,picture, given_name , family_name } = payload;
    let user = await dbServices.findOne({
        model : userModel,
        filter : {email : email.toLowerCase()}
    })

    if(!user){
        user = await dbServices.create({
            model: userModel,
            data: {
                email,
                isConfirmed : email_verified,
                profileImage : picture,
                fName : given_name,
                lName : family_name,
                provider : providerEnum.google
            }
        })
    }

    if(user.provider == providerEnum.system){
        throw new Error("the account already exist on system please log in with system" , {cause : 400});
    }
    const access_token = jwt.sign({id : user._id} , env.ACCESS_TOKEN_SIGNTURE ,{
        expiresIn : env.ACCESS_TOKEN_EXP
    });
    const refresh_token = jwt.sign({id : user._id} , env.REFRESH_TOKEN_SIGNTURE , {
        expiresIn : env.REFRESH_TOKEN_EXP
    });

    successResponse({res , message : "user loggin in with google successfully"});

}


//====================================== refresh token ===========================

export const refreshToken = async(req,res,next)=>{
    const {authorization} = req.headers;
    if(!authorization){
        throw new Error("refresh token is required" , {casue : 400});
    }
    
    const verifyToken = jwt.verify(authorization , env.REFRESH_TOKEN_SIGNTURE);
    if(Date.now() < verifyToken.iat + env.ACCESS_TOKEN_EXP){
        throw new Error("access token is still vaild" , {casue : 400});
    }

    const user = await dbServices.findById({
        model : userModel,
        id : verifyToken.id
    })

    if(!user){
        throw new Error("user not exist" , {cause : 404});
    }

    const access_token = jwt.sign({id : user._id}, env.ACCESS_TOKEN_SIGNTURE, {
        expiresIn : env.ACCESS_TOKEN_EXP
    })

    successResponse({res , message : "access token created successfully" , data : access_token});

}

//====================================== share profile user ===========================

export const shareProfile = async(req,res,next)=>{
const {id} = req.params;
const user = await dbServices.findById({
    model : userModel,
    id,
    options : {password : 0 , provider : 0 , createdAt : 0 , updatedAt : 0 , __v : 0}
})

if(!user){
    throw new Error("user not exist" , {cause : 404});
}

user.phone = Decrypt(user.phone);

successResponse({res , data : user});

}

// ================================== update profile =================================
export const updateProfile = async(req,res,next)=>{
    
    const {fName , lName , age , phone , gender} = req.body;
    const updateQuery = {}

    if(fName !== undefined){
        updateQuery.fName = fName;
    }
    
    if(lName !== undefined){
        updateQuery.lName = lName;
    }

    if(age !== undefined){
        updateQuery.age = age;
    }

    if(phone !== undefined){
        updateQuery.phone = Encrypt(phone);
    }

    if(gender !== undefined){
        updateQuery.gender = gender;
    }

    const user = await dbServices.findByIdAndUpdate({
        model : userModel,
        id : req.user._id,
        update : updateQuery
    });

    successResponse({res , message : "user updated" , data : user });

}


// ================================== update password =================================

export const updatePassword = async(req,res,next) =>{
    const {oldPassword , newPassword } = req.body;

    if(!await CompareSync({plainText : oldPassword , Encrypt : req.user.password})){
        throw new Error("invaild old password" , {cause : 400});
    }

    if(await CompareSync({plainText : newPassword , Encrypt : req.user.password})){
        throw new Error("the old password same new password" , {cause : 400});
    }

    req.user.password = await HashSync(newPassword , env.SALT_ROUNDS);
    req.user.changeCredentialAt = Date.now();

    await req.user.save();
    
    successResponse({res , message : "password updated successfully" , data :{user : req.user}});
}


//====================================== log out user ===========================



export const logOut = async(req,res,next)=>{
const {flag} = req.query;

if(flag == "all"){
    req.user.changeCredentialAt = Date.now();
    req.user.save();
    await dbRedis.deleteKey(dbRedis.keys(`revoke_token::${req.user._id}`));
}

else{
await dbRedis.setValue({
    key : `revoke_token::${req.user._id}::${req.verifyToken.jti}`,
    value : `${req.verifyToken.jti}`,
    ttl : req.verifyToken.exp - Math.floor(Date.now() / 1000)

})
}

successResponse({res, message : "log out successfully"});
}

//====================================== confirm email ===========================

export const confirmEmail = async(req,res,next) =>{
    const {email , otp} = req.body;
    const otpValue = await dbRedis.getValue(`otp::${email}`);
    if(!otpValue){
        throw new Error("otp is expired" , {cause : 400});
    }

    if(!await CompareSync({plainText : otp , Encrypt : otpValue})){
        throw new Error("otp is invalid" , {cause : 400});
    }

    const user = await dbServices.findOneAndUpdate({
        model : userModel,
        filter : {
            email,
            isConfirmed : {$exists : false}
        },
        update : {
            isConfirmed : true
        }
    })

    if(!user){
        throw new Error("user not found or confirmed already" , {cause : 400});
    }

    await dbRedis.deleteKey(otpValue);

    successResponse({res , message : "email confirmed successfully" , data : user});
}

//====================================== resend otp ===========================

export const reSendOtp = async(req,res,next)=>{
    const {email} = req.body;

    await sendEmailOtp({
        email,
        subject : "confirm_email",
        isConfirmed : false,
        eventOn : "confirm_email"
    })

    successResponse({res , message : "operation of resend otp done successfully"});

}

//====================================== forget password ===========================
export const forgetPassword = async(req,res,next) =>{

    const {email} = req.body;

    await sendEmailOtp({
        email,
        subject : "forget_password",
        isConfirmed : true,
        eventOn : "forget_password"
    });

    successResponse({res})

}
//====================================== reset password ===========================
export const resetPassword = async(req,res,next) =>{
    
    const {email , password , otp} = req.body;
    
    const emailLowerCase = email.toLowerCase()
    const otpValue = await dbRedis.getValue(`otp::${emailLowerCase}`);
    if(!otpValue){
        throw new Error("otp is expired or email ivalid" , {cause : 400});
    }

    if(!await CompareSync({plainText : otp , Encrypt : otpValue})){
        throw new Error("otp invalid" , {cause : 400});
    }

    const user = await dbServices.findOneAndUpdate({
        model : userModel,
        filter : {email,
            isConfirmed : true
        },
        update : {
            password : await HashSync(password , env.SALT_ROUNDS),
            changeCredentialAt : Date.now()
        }
    })

    if(!user){
        throw new Error("user not found or not confirmed yet" , {cause : 400});
    }

    await dbRedis.deleteKey(`otp::${emailLowerCase}`);

    successResponse({res, message : "reset password done successfully"});
} 