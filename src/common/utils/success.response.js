
export const successResponse = ({res , statusCode = 200,
    message = "done", data = undefined
} = {})=>{
return res.status(statusCode).json({message , data});
}