import  jwt  from 'jsonwebtoken';
import { findById, findOne } from '../../DB/service/db.service.js';
import userModel from '../../DB/model/user.model.js';
import { ttl } from '../../DB/service/redis.service.js';
import { ACCESS_TOKEN_SIGNTURE } from '../../../config/config.service.js';

export const authentication = async(req,res,next)=>{
const {authorization} = req.headers;

if(!authorization){
    throw new Error("token is required" , {cause : 400});
}

const verifyToken = jwt.verify(authorization , ACCESS_TOKEN_SIGNTURE);

if(!verifyToken){
    throw new Error("invalid token");
}

const user = await findById({
    model : userModel,
    id : verifyToken.id
});

if(!user){
    throw new Error("user not exist" , {casue : 404});
}

// log out from all device
if(user?.changeCredentialAt?.getTime() > verifyToken.iat * 1000){
    throw new Error("the token is expired please log in" , {cause : 400});
}

if(!user?.isConfirmed){
    throw new Error("user not confirmed yet" , {cause : 400});
}

// log out from specific device
if(await ttl(`revoke_token::${user._id}::${verifyToken.jti}`) > 0){
    throw new Error("the token is expired y logged out from this device" , {cause : 400});

}


req.user = user;
// console.log(verifyToken);
// console.log(user);

req.verifyToken = verifyToken

next();
}