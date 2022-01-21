
  exports.ristrictTo = (...roles) => {
    
    return (req,res,next) => {
        //console.log(req.user.userRole);
        if (!roles.includes(req.user.userRole)) {
            return res.status(403).json({
                success: false,
                message:"Only an admin is allowed to perform this action..!"
              });
        } 
        next();       
    }
    
};