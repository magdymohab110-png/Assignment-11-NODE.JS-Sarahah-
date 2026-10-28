import { Router } from "express";
import * as US from './user.service.js';
import Validation from "../../common/middleware/validation.js";
import * as schema from "./user.schema.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authoriztion } from "../../common/middleware/authroization.js";
import { multerLocal } from "../../common/middleware/multer.js";
import { roleEnum } from "../../enum/user.enum.js";
import { multerEnum } from './../../enum/multer.enum.js';

const userRouter = Router({strict : true , caseSensitive : true});

// sign up user
userRouter.post("/signup" , 
    multerLocal({customPath : "admins" ,customTypes : multerEnum.images}).fields([
        {name : "attachment" , maxCount : 1},
        {name : "attachments" , maxCount : 5}
    ]) 
    ,Validation(schema.signUpSchema), US.signUp);

//sign in user
userRouter.post("/signin" ,Validation(schema.signInSchema), US.signIn);

// get profile user
userRouter.get("/profile" , authentication , authoriztion(Object.keys(roleEnum)) , US.getProfile);

//user signup with gmail (google);
userRouter.post("/signup/gmail" , US.signUpWithGmail);

// refresh token
userRouter.post("/refresh-token",Validation(schema.refreshTokenSchema) , US.refreshToken);

// share profile
userRouter.get("/share-profile/:id" , Validation(schema.shareProfileSchema) , US.shareProfile);

// update profile
userRouter.patch("/update-profile" , Validation(schema.updateProfileSchema) , authentication 
, US.updateProfile);

// update password
userRouter.patch("/update-password" , Validation(schema.updatePasswordSchema) , authentication 
, US.updatePassword);

// log out user
userRouter.patch("/logout" , authentication , US.logOut);

// confirm email
userRouter.patch("/confirm-email" , Validation(schema.confirmEmailSchema) , US.confirmEmail)

// resend otp
userRouter.patch("/resend-otp" , Validation(schema.reSendOtpSchema) , US.reSendOtp);

// forget password
userRouter.patch("/forget-password" , Validation(schema.forgetPasswordSchema) , US.forgetPassword);

//reset password
userRouter.patch("/reset-password" , Validation(schema.resetPasswordSchema) , US.resetPassword);


export default userRouter;