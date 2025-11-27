import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoConnect from "./config/db.js";
import authRouter from "./router/auth.router.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({
    extended : true
}))

// routes
app.use("/auth",authRouter);

app.listen(process.env.PORT || 8080, async()=>{
    try{
        await mongoConnect();
        console.log(`Server is listening to PORT ${process.env.PORT}`);
    }catch(err){
        console.error(err);
    }
})