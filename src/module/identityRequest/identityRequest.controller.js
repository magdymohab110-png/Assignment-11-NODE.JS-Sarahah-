import { Router } from "express";
import { authentication } from "../../common/middleware/authentication.js";
import * as IRV from './identityRequest.schema.js';
import * as IR from './identityRequest.service.js';
import Validation from "../../common/middleware/validation.js";

const identityRequestRouter = Router();

// create identity requests
identityRequestRouter.post("/", authentication , 
    Validation(IRV.createIdentityRequestSchema) , IR.createIdentityRequest )

// get pend identity requests
identityRequestRouter.get("/pending" , authentication ,IR.pendIdentityRequest);

// update identity request
identityRequestRouter.patch("/:requestId" , authentication,
    Validation(IRV.updateIdentityRequestSchema) , IR.updateIdentityRequest);

// status identity request
identityRequestRouter.get("/status/:requestId" , authentication,
    Validation(IRV.statusIdentityRequestSchema) , IR.statusIdentityRequest);

export default identityRequestRouter;