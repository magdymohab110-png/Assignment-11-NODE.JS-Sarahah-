

const Validation = (schema)=>{

    return (req,res,next) =>{
        const errResult = [];
        for (const key of Object.keys(schema)) {
            const {error} = schema[key].validate(req[key] , {abortEarly : false})
           if(error){
             error.details.forEach((err) => {
                errResult.push({
                    message : err.message ,
                    path : err.path[0],
                    key
                })
            });
           }
        }
        if(errResult.length){
            const error = new Error("Validation error !");
            error.errors = errResult;
            throw error
        }
        next();
    }
}

export default Validation