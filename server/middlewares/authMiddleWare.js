import jwt from "jsonwebtoken";

export const authMiddleWare = async (req,res,next) =>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        res.status(401).json({message:"Unauthorized"});
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    try{
        const payload = jwt.verify(token,process.env.JWT_SECRET);
        req.user = payload;
        next();
    }catch(error){
        console.log(error);
        res.status(401).json({message:"Unauthorized"});
    }
}