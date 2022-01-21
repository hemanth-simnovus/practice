// message,type,tag,subcode
module.exports= (message,type="validationError",tag =null,subCode="E001") => {
  let obj = {
    message: message,
    type: type,
    tag: tag,
    sub_code:subCode
  };
  return obj;
};