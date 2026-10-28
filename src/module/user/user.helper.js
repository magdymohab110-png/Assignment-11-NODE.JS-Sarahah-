
import { HashSync } from '../../common/security/hash.js';
import { generate_otp, sendEmail } from '../../common/service/sendEmail.js';
import { eventEmitter } from '../../common/utils/events.js';
import { findOne } from '../../DB/service/db.service.js';
import * as dbRedis from './../../DB/service/redis.service.js';
import emailTemplate from './../../common/utils/otp-email-template.js';
import userModel from '../../DB/model/user.model.js';
import { OTP_BLOCK_SENDEMAIL, OTP_EMAIL, OTP_MAX_EMAIL, SALT_ROUNDS } from '../../../config/config.service.js';


export const sendEmailOtp = async({email , subject = "confirm_email" , isConfirmed, eventOn = "confirm_email",  }) =>{

        const isBlockedOtp = await dbRedis.ttl(`otp::block::${email}`);
        if(isBlockedOtp > 0){
            throw new Error(`you are blocked from system y can try again after ${isBlockedOtp} seconds` 
                , {cause : 400});
        }
        const maxCount = await dbRedis.getValue(`otp::max::${email}`);
    
        if(isBlockedOtp < 0){
            if(maxCount > 3){
                await dbRedis.setValue({
                    key : `otp::max::${email}`,
                    value : 0,
                    ttl : OTP_MAX_EMAIL
                })
            }
        }
    
        const presentOtp = await dbRedis.ttl(`otp::${email}`);
        if(presentOtp > 0){
            throw new Error(`you can resend otp after ${presentOtp} seconds`);
        }
    
        
        if(maxCount >= 3){
            await dbRedis.setValue({
                key : `otp::block::${email}`,
                value : "1",
                ttl : OTP_BLOCK_SENDEMAIL
            })
            throw new Error(`you exceed the number of requests`);
        }
    
        const user = await findOne({
            model : userModel,
            filter : {
                email,
                isConfirmed : {$exists : isConfirmed}
            }
        });
        
        if(!user){
            throw new Error(`the user not found or already confirmed` , {cause : 400});
        }
    
        const otp = await generate_otp();
        const otpHash = await HashSync(otp , SALT_ROUNDS);
    
        eventEmitter.emit(eventOn , async ()=>{
            await sendEmail({
                to : email,
                subject : `${subject} from sarahah app`,
                html : await emailTemplate({
                    appName : "Sarahah app",
                    userName : user.fName,
                    otp,
                    expiryMinutes : (OTP_EMAIL / 60)
                })
            })
        })
    
        await dbRedis.setValue({
            key : `otp::${email}`,
            value : otpHash,
            ttl : OTP_EMAIL
        });
    
        await dbRedis.incr(`otp::max::${email}`);
}