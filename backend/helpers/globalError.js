class GlobalError extends Error {
    
    constructor(errorArray,statusCode){
         super(statusCode);
        this.errorArray=errorArray
        this.statusCode=statusCode;
        this.isOperational= true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports= GlobalError;