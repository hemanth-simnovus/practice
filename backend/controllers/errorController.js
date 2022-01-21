const createErrorObj = require('../helpers/createErrorObj');

module.exports =async (err, req, res, next) => {
 if (err.isOperational) {
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode).json({
        errors: err.errorArray,
      });
    } else {
        // Programming or other unknown error
        if (err.name === 'SyntaxError') {
            let arrError =[];
            arrError.push(createErrorObj("Invalid JSON request","SyntaxError"));
            return res.status(400).json({
                errors: arrError
              });      
        }
        
        let ProgrammingError=[{
            message: "Something went wrong...!",
            type: 'error',
            tag: null,
            sub_code:'E001'
        }]
      res.status(500).json({
        errors: ProgrammingError
      });
    }
  };

//   if (typeof (err) === 'string') {
//     // custom application error
//     return res.status(400).json({ message: err })
//   }

//   if (err.name === 'UnauthorizedError') {
//     // jwt authentication error
//     return res.status(401).json({ message: 'Invalid Token' })
//   }

//   if (err.name === 'SyntaxError') {
//     return res.status(400).json({ message: 'Invalid JSON request' })
//   }
//   // default to 500 server error
//   return res.status(500).json({ message: err.message })