
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SIGNTURE } from '../../../config/config.service.js';
import { findById } from '../../DB/service/db.service.js';
import userModel from '../../DB/model/user.model.js';

 const optionalAuthentication = async(req , res ,next)=>{
 try {
    
    if(!authorization){
        return next();
    }

    const verifyToken = jwt.verify(authorization , ACCESS_TOKEN_SIGNTURE);
    if(!verifyToken){
        return next();
    }

    const user = await findById({
        model : userModel,
        id : verifyToken.id
    });


    if(!user || !user?.isConfirmed){
       return next();
    }

    req.user = user;
    req.verifyToken = verifyToken;
    next();

 } catch (error) {
     next();
 }

}

export default optionalAuthentication